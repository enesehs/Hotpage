# HotPage - Bug Report

> **Tarih:** 2025-12-14  
> **Kapsam:** Functional Bugs, Edge Cases, Code Issues

---

## 🔴 YÜKSEK ÖNCELİKLİ BUGLAR

### 1. StickyNotes - Infinite Loop Potansiyeli

**Dosya:** `StickyNotes.tsx` (L59-88)

```tsx
useEffect(() => {
  if (!note) {
    const newNote: StickyNote = { /* ... */ };
    onNoteChange(newNote); // ⚠️ Parent state değişiyor
  } else if (!note.pomodoro || !note.todos || !note.mode) {
    onNoteChange({ ...note, /* ... */ }); // ⚠️ Parent state değişiyor
  }
}, [note, onNoteChange]); // note değişince tekrar çalışır!
```

**Problem:**
- `onNoteChange` çağrısı parent'ta `settings` state'ini değiştirir
- `note` prop'u değişir → useEffect tekrar çalışır
- Teorik olarak infinite loop oluşabilir (React stabilizasyonu ile engelleniyor ama riskli pattern)

**Etki:** Performans sorunları, gereksiz re-render

**Çözüm:**
```tsx
useEffect(() => {
  if (!note) {
    onNoteChange(/* ... */);
  }
}, []); // Sadece mount'ta çalışsın

useEffect(() => {
  if (note && (!note.pomodoro || !note.todos || !note.mode)) {
    onNoteChange(/* migrated note */);
  }
}, [note?.id]); // Sadece ID değişince
```

---

### 2. Quotes - refreshQuote Fonksiyonu useEffect Dependency'de Eksik

**Dosya:** `Quotes.tsx` (L15-25)

```tsx
useEffect(() => {
  refreshQuote(); // ⚠️ refreshQuote dependency yok
}, [locale]);

useEffect(() => {
  const interval = setInterval(() => {
    refreshQuote(); // ⚠️ refreshQuote dependency yok
  }, refreshInterval * 60 * 1000);
  return () => clearInterval(interval);
}, [locale]); // refreshQuote, refreshInterval eksik
```

**Problem:**
- ESLint `react-hooks/exhaustive-deps` uyarısı
- `refreshQuote` fonksiyonu her render'da yeniden oluşturuluyor
- Closure stale reference sorunu

**Etki:** Quote yenilemesi beklendiği gibi çalışmayabilir

**Çözüm:**
```tsx
const refreshQuote = useCallback(() => {
  setIsRefreshing(true);
  const quote = getRandomQuote(locale);
  setCurrentQuote(quote);
  setTimeout(() => setIsRefreshing(false), 300);
}, [locale]);

useEffect(() => {
  refreshQuote();
}, [refreshQuote]);
```

---

### 3. loadSettings - Async İşlem Senkron Fonksiyonda

**Dosya:** `storage.ts` (L111-142)

```typescript
export const loadSettings = (): Settings => {
  // ...
  if (settings.background.randomMode && /* ... */) {
    imageStorage.getImage(settings.background.currentImageId).then(url => {
      if (url) {
        settings.background.value = url; // ⚠️ Mutasyon!
      }
    });
  }
  return settings; // ⚠️ Promise bitmeden return!
};
```

**Problem:**
- `loadSettings` senkron fonksiyon ama içinde async işlem var
- `settings.background.value` daha sonra güncellenecek ama zaten return edilmiş
- Mutasyon işlemi yapılıyor (anti-pattern)

**Etki:** Random arka plan bazen yüklenmiyor, ilk açılışta siyah ekran

**Çözüm:**
```typescript
export const loadSettings = (): Settings => {
  // Async işlemi buradan kaldır
  // App.tsx'te ayrı useEffect ile yapılmalı (zaten yapılıyor)
  return settings;
};
```

---

## 🟠 ORTA ÖNCELİKLİ BUGLAR

### 4. RSS - XML Parse Hatası Yakalanmıyor

**Dosya:** `RSS.tsx` (L87-125)

```typescript
const parseRss = (xml: string, feedUrl: string, category: string): RSSItem[] => {
  const doc = new DOMParser().parseFromString(xml, 'text/xml');
  // ⚠️ Parse error kontrolü yok
  const items = Array.from(doc.querySelectorAll('item, entry'));
  // ...
};
```

**Problem:**
- Invalid XML parse edildiğinde `DOMParser` hata fırlatmaz
- `doc.querySelector('parsererror')` ile kontrol edilmeli
- Kötü formatlı RSS crash'e neden olmasa da boş sonuç döner

**Etki:** Hatalı RSS feed'leri sessizce başarısız oluyor, kullanıcıya bilgi verilmiyor

**Çözüm:**
```typescript
const parseRss = (xml: string, feedUrl: string, category: string): RSSItem[] => {
  const doc = new DOMParser().parseFromString(xml, 'text/xml');
  
  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    throw new Error(`Invalid RSS XML: ${parseError.textContent}`);
  }
  // ...
};
```

---

### 5. Weather - Debounce Timer Leak

**Dosya:** `Weather.tsx` (L57-63)

```tsx
useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedLocation(manualLocation);
  }, 800);

  return () => clearTimeout(timer);
}, [manualLocation]);
```

**Problem:** Bu kısım doğru, AMA:

**Dosya:** `Weather.tsx` (L179-184)

```tsx
useEffect(() => {
  fetchWeather();
  const interval = setInterval(fetchWeather, minutes * 60 * 1000);
  return () => clearInterval(interval);
}, [refresh, refreshMinutes]); // ⚠️ minutes tanımlı değil, refreshMinutes kullanılmalı
```

**Problem:**
- `minutes` değişkeni `refreshMinutes`'dan türetiliyor ama dependency'de `refreshMinutes` var
- Her refresh değişiminde interval yeniden oluşturuluyor (doğru davranış)
- Ancak `fetchWeather` dependency'de yok - stale closure riski

**Çözüm:**
```tsx
useEffect(() => {
  fetchWeather();
  const interval = setInterval(fetchWeather, refreshMinutes * 60 * 1000);
  return () => clearInterval(interval);
}, [fetchWeather, refreshMinutes]);
```

---

### 6. SecretLinks - URL Validasyonu Eksik

**Dosya:** `SecretLinks.tsx` (L33-45)

```typescript
const handleAddLink = () => {
  let url = newUrl.trim();
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  // ⚠️ URL geçerliliği kontrol edilmiyor
  const newLink: SecretLink = { /* ... */ url };
  // ...
};
```

**Problem:**
- `"asdf"` gibi geçersiz input `"https://asdf"` olarak kaydediliyor
- Tıklandığında browser navigasyon hatası verebilir

**Etki:** Geçersiz URL'ler kaydedilebiliyor

**Çözüm:**
```typescript
const handleAddLink = () => {
  let url = newUrl.trim();
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  
  try {
    new URL(url); // Validate
  } catch {
    alert('Invalid URL');
    return;
  }
  // ...
};
```

---

### 7. Currency - isTurkish Dependency Eksik

**Dosya:** `Currency.tsx` (L236)

```typescript
}, [baseCurrency, enabledCryptos, isTurkish, locale, showSparkline]);
```

**Problem:**
- `fetchCryptos` callback'inde `isTurkish` bağımsız değişken olarak kullanılmıyor aslında
- Fakat `fetchCurrencies`'de kullanılıyor ve dependency doğru

Bu bug değil, sadece not.

---

### 8. QuickLinks - Drag State Temizlenmemiş Kalabilir

**Dosya:** `QuickLinks.tsx` (L119-121)

```tsx
const handleDragEnd = () => {
  setDraggedItem(null);
};
```

**Problem:**
- `handleDrop` başarılı olunca `setDraggedItem(null)` çağrılıyor
- Ama drop target dışına bırakılırsa `dragend` event'i tetiklenir
- Event listener olmadığı için `draggedItem` state'i null kalmayabilir

**Etki:** Sürükleme iptal edilirse UI bozuk kalabilir

**Çözüm:**
```tsx
<a
  // ...
  onDragEnd={handleDragEnd}
  // ...
>
```

**Not:** Zaten `onDragEnd={handleDragEnd}` var, bu doğru implementasyon.

---

## 🟡 DÜŞÜK ÖNCELİKLİ BUGLAR

### 9. App - saveTimeoutRef Memory Leak Potansiyeli

**Dosya:** `App.tsx` (L117-133)

```tsx
useEffect(() => {
  if (saveTimeoutRef.current) {
    clearTimeout(saveTimeoutRef.current);
  }
  
  saveTimeoutRef.current = window.setTimeout(() => {
    saveSettings(settings);
  }, 100);
  
  return () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
  };
}, [settings]);
```

**Problem:**
- Bu implementasyon doğru görünüyor
- Ancak `settings` her değiştiğinde yeni timeout oluşuyor
- Çok hızlı değişimlerde performans etkisi olabilir

**Etki:** Minimal - debounce doğru çalışıyor

---

### 10. IntroModal - Video Yolu Hardcoded

**Dosya:** `IntroModal.tsx` (L55)

```tsx
<img src="/video/introduction.gif" alt="HotPage introduction" className="intro-video" />
```

**Problem:**
- Extension olarak yüklendiğinde path farklı olabilir
- Chrome extension'da `chrome.runtime.getURL()` kullanılmalı

**Etki:** Extension olarak yüklendiğinde intro video görünmeyebilir

**Çözüm:**
```tsx
const getAssetUrl = (path: string) => {
  if (typeof chrome !== 'undefined' && chrome.runtime?.getURL) {
    return chrome.runtime.getURL(path);
  }
  return path;
};

<img src={getAssetUrl("/video/introduction.gif")} />
```

---

### 11. Pomodoro - Ses Çalmama Durumu

**Dosya:** `pomodoroSound.ts`

**Problem:**
- `AudioContext` kullanıcı etkileşimi olmadan başlatılamaz (Chrome policy)
- İlk pomodoro tamamlandığında ses çalmayabilir

**Etki:** Kullanıcı sayfayla etkileşime girmeden pomodoro biterse ses çalmaz

**Çözüm:**
```typescript
// AudioContext'i kullanıcı etkileşiminde resume et
const resumeAudioContext = () => {
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
};
document.addEventListener('click', resumeAudioContext, { once: true });
```

---

### 12. Clock - Saniye Gecikmesi

**Dosya:** `Clock.tsx` (L11-17)

```tsx
useEffect(() => {
  const timer = setInterval(() => {
    setTime(new Date());
  }, 1000);
  return () => clearInterval(timer);
}, []);
```

**Problem:**
- Component mount olduğunda tam saniyede değil, herhangi bir anda başlıyor
- Örneğin 12:30:45.500'de mount olursa, bir sonraki güncelleme 12:30:46.500'de olur
- Gerçek saat ile 0-1 saniye fark olabilir

**Etki:** Saat gerçek saatten 0-1 saniye kayık görünebilir

**Çözüm:**
```tsx
useEffect(() => {
  setTime(new Date()); // Hemen güncelle
  
  // İlk saniyeye senkronize ol
  const msUntilNextSecond = 1000 - (Date.now() % 1000);
  const initialTimeout = setTimeout(() => {
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, msUntilNextSecond);
  
  return () => clearTimeout(initialTimeout);
}, []);
```

---

## 📋 ÖNCELİK SIRASI

### Hemen Düzeltilmeli
1. ✅ RSS XML parse error handling - DÜZELTILDI
2. ✅ Quotes useEffect dependency fix - DÜZELTILDI
3. ✅ StickyNotes infinite loop prevention - DÜZELTILDI

### Yakın Zamanda
4. ✅ SecretLinks URL validation - DÜZELTILDI
5. ✅ IntroModal asset path for extension - DÜZELTILDI
6. ⏭️ Weather fetchWeather dependency - Şu an sorun yaratmıyor

### İyileştirme
7. ✅ Clock saniye senkronizasyonu - DÜZELTILDI
8. ⏭️ Pomodoro AudioContext policy - Düşük öncelik
9. ✅ loadSettings async işlem temizliği - DÜZELTILDI

---

## ✅ DOĞRU IMPLEMENTASYONLAR

- ✅ Settings debounced save (App.tsx)
- ✅ Drag and drop cleanup (QuickLinks.tsx)
- ✅ Weather location debounce
- ✅ RSS feed deduplication
- ✅ Theme application on mount
- ✅ Background image lazy loading
