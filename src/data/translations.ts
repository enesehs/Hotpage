export interface Translations {
  // Weather Widget
  weather: {
    title: string;
    feelsLike: string;
    humidity: string;
    loading: string;
    error: string;
    conditions: {
      clear: string;
      mostlyClear: string;
      partlyCloudy: string;
      overcast: string;
      foggy: string;
      drizzle: string;
      freezingDrizzle: string;
      rainy: string;
      freezingRain: string;
      snowy: string;
      showers: string;
      snowShowers: string;
      thunderstorm: string;
      unknown: string;
    };
  };

  // Currency Widget
  currency: {
    title: string;
    tabCurrency: string;
    tabCrypto: string;
    loading: string;
    error: string;
    errorCurrency: string;
    errorCrypto: string;
    tryAgain: string;
  };

  // RSS Widget
  rss: {
    title: string;
    loading: string;
    categoryAll: string;
    noItems: string;
    noItemsCategory: string;
    errorTooltip: string;
  };

  // Quotes Widget
  quotes: {
    title: string;
  };

  // Settings Panel
  settings: {
    title: string;
    tabs: {
      general: string;
      appearance: string;
      widgets: string;
      advanced: string;
    };
    general: {
      language: string;
      searchEngine: string;
    };
    appearance: {
      theme: string;
      background: string;
      backgroundType: string;
      solid: string;
      gradient: string;
      image: string;
      pexels: string;
      random: string;
      blur: string;
      opacity: string;
      uploadImage: string;
      deleteImage: string;
    };
    widgets: {
      title: string;
      enabled: string;
      disabled: string;
      widgetOrder: string;
    };
    advanced: {
      exportSettings: string;
      importSettings: string;
      resetSettings: string;
      resetConfirm: string;
    };
  };

  // Common
  common: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    add: string;
    remove: string;
    close: string;
    refresh: string;
  };
}

export const translations: Record<string, Translations> = {
  'en-US': {
    weather: {
      title: 'Weather',
      feelsLike: 'Feels like',
      humidity: 'Humidity',
      loading: 'Loading weather...',
      error: 'Weather unavailable',
      conditions: {
        clear: 'Clear',
        mostlyClear: 'Mostly Clear',
        partlyCloudy: 'Partly Cloudy',
        overcast: 'Overcast',
        foggy: 'Foggy',
        drizzle: 'Drizzle',
        freezingDrizzle: 'Freezing Drizzle',
        rainy: 'Rainy',
        freezingRain: 'Freezing Rain',
        snowy: 'Snowy',
        showers: 'Showers',
        snowShowers: 'Snow Showers',
        thunderstorm: 'Thunderstorm',
        unknown: 'Unknown',
      },
    },
    currency: {
      title: 'Currency & Crypto',
      tabCurrency: 'Currency',
      tabCrypto: 'Crypto',
      loading: 'Loading...',
      error: 'Could not fetch data',
      errorCurrency: 'Could not fetch exchange rates',
      errorCrypto: 'Could not fetch crypto prices',
      tryAgain: 'Try Again',
    },
    rss: {
      title: 'News',
      loading: 'Loading news...',
      categoryAll: 'All',
      noItems: 'No items found in any category.',
      noItemsCategory: 'No items found in category',
      errorTooltip: 'Some feeds failed to load',
    },
    quotes: {
      title: 'Quotes',
    },
    settings: {
      title: 'Settings',
      tabs: {
        general: 'General',
        appearance: 'Appearance',
        widgets: 'Widgets',
        advanced: 'Advanced',
      },
      general: {
        language: 'Language',
        searchEngine: 'Search Engine',
      },
      appearance: {
        theme: 'Theme',
        background: 'Background',
        backgroundType: 'Background Type',
        solid: 'Solid Color',
        gradient: 'Gradient',
        image: 'Image',
        pexels: 'Pexels',
        random: 'Random Mode',
        blur: 'Blur',
        opacity: 'Opacity',
        uploadImage: 'Upload Image',
        deleteImage: 'Delete Image',
      },
      widgets: {
        title: 'Widgets',
        enabled: 'Enabled',
        disabled: 'Disabled',
        widgetOrder: 'Widget Order',
      },
      advanced: {
        exportSettings: 'Export Settings',
        importSettings: 'Import Settings',
        resetSettings: 'Reset Settings',
        resetConfirm: 'Are you sure you want to reset all settings?',
      },
    },
    common: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      remove: 'Remove',
      close: 'Close',
      refresh: 'Refresh',
    },
  },

  'tr-TR': {
    weather: {
      title: 'Hava Durumu',
      feelsLike: 'Hissedilen',
      humidity: 'Nem',
      loading: 'Hava durumu yükleniyor...',
      error: 'Hava durumu yüklenemedi',
      conditions: {
        clear: 'Açık',
        mostlyClear: 'Çoğunlukla Açık',
        partlyCloudy: 'Parçalı Bulutlu',
        overcast: 'Bulutlu',
        foggy: 'Sisli',
        drizzle: 'Çisenti',
        freezingDrizzle: 'Dondurucu Çisenti',
        rainy: 'Yağmurlu',
        freezingRain: 'Dondurucu Yağmur',
        snowy: 'Karlı',
        showers: 'Sağanak',
        snowShowers: 'Kar Sağanağı',
        thunderstorm: 'Gök Gürültülü Fırtına',
        unknown: 'Bilinmiyor',
      },
    },
    currency: {
      title: 'Döviz & Kripto',
      tabCurrency: 'Döviz',
      tabCrypto: 'Kripto',
      loading: 'Yükleniyor...',
      error: 'Veri alınamadı',
      errorCurrency: 'Döviz kurları alınamadı',
      errorCrypto: 'Kripto fiyatları alınamadı',
      tryAgain: 'Tekrar Dene',
    },
    rss: {
      title: 'Haberler',
      loading: 'Haberler yükleniyor...',
      categoryAll: 'Tümü',
      noItems: 'Hiçbir kategoride öğe bulunamadı.',
      noItemsCategory: 'Kategoride öğe bulunamadı',
      errorTooltip: 'Bazı akışlar yüklenemedi',
    },
    quotes: {
      title: 'Alıntılar',
    },
    settings: {
      title: 'Ayarlar',
      tabs: {
        general: 'Genel',
        appearance: 'Görünüm',
        widgets: 'Widget\'lar',
        advanced: 'Gelişmiş',
      },
      general: {
        language: 'Dil',
        searchEngine: 'Arama Motoru',
      },
      appearance: {
        theme: 'Tema',
        background: 'Arka Plan',
        backgroundType: 'Arka Plan Türü',
        solid: 'Düz Renk',
        gradient: 'Gradyan',
        image: 'Resim',
        pexels: 'Pexels',
        random: 'Rastgele Mod',
        blur: 'Bulanıklık',
        opacity: 'Opaklık',
        uploadImage: 'Resim Yükle',
        deleteImage: 'Resmi Sil',
      },
      widgets: {
        title: 'Widget\'lar',
        enabled: 'Aktif',
        disabled: 'Devre Dışı',
        widgetOrder: 'Widget Sıralaması',
      },
      advanced: {
        exportSettings: 'Ayarları Dışa Aktar',
        importSettings: 'Ayarları İçe Aktar',
        resetSettings: 'Ayarları Sıfırla',
        resetConfirm: 'Tüm ayarları sıfırlamak istediğinizden emin misiniz?',
      },
    },
    common: {
      save: 'Kaydet',
      cancel: 'İptal',
      delete: 'Sil',
      edit: 'Düzenle',
      add: 'Ekle',
      remove: 'Kaldır',
      close: 'Kapat',
      refresh: 'Yenile',
    },
  },
};

export const getTranslations = (locale: string = 'en-US'): Translations => {
  return translations[locale] || translations['en-US'];
};
