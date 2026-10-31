export type Locale = 'en' | 'si' | 'ta';

export interface TranslationDictionary {
  app: {
    title: string;
    tagline: string;
    guest: string;
    pro: string;
    searchPlaceholder: string;
    quickSearch: string;
  };
  navigation: {
    feed: string;
    notes: string;
    split: string;
    canvas: string;
    export: string;
    history: string;
    shortcuts: string;
    fullscreen: string;
    themeDark: string;
    themeLight: string;
  };
  sync: {
    synced: string;
    syncing: string;
    offline: string;
    conflict: string;
    error: string;
  };
  studyHub: {
    aiStudy: string;
    aiTitle: string;
    flashcards: string;
    flashcardsTitle: string;
    focus: string;
    focusTitle: string;
    slides: string;
    slidesTitle: string;
  };
  canvas: {
    pen: string;
    highlighter: string;
    eraser: string;
    shapes: string;
    laser: string;
    palmRejection: string;
    autoShape: string;
    clear: string;
    undo: string;
    redo: string;
    zoomIn: string;
    zoomOut: string;
    resetView: string;
    page: string;
    addPage: string;
  };
  sidebar: {
    workspaces: string;
    notebooks: string;
    notes: string;
    newNote: string;
    searchNotes: string;
    trash: string;
    storage: string;
    backup: string;
  };
  actions: {
    save: string;
    cancel: string;
    delete: string;
    rename: string;
    duplicate: string;
    pin: string;
    unpin: string;
    copy: string;
    copied: string;
    reload: string;
    close: string;
  };
}

export const translations: Record<Locale, TranslationDictionary> = {
  en: {
    app: {
      title: 'ScribbleNote',
      tagline: 'The notebook for lectures: typed notes + handwriting + slides + audio in ONE place.',
      guest: 'Guest Mode',
      pro: 'PRO',
      searchPlaceholder: 'Quick actions & search...',
      quickSearch: 'Search...',
    },
    navigation: {
      feed: 'Feed',
      notes: 'Notes',
      split: 'Split',
      canvas: 'Canvas',
      export: 'Export',
      history: 'Version History',
      shortcuts: 'Keyboard Shortcuts',
      fullscreen: 'Fullscreen',
      themeDark: 'Dark Mode',
      themeLight: 'Light Mode',
    },
    sync: {
      synced: 'Synced',
      syncing: 'Syncing...',
      offline: 'Offline',
      conflict: 'Conflict',
      error: 'Sync Error',
    },
    studyHub: {
      aiStudy: 'AI Study',
      aiTitle: 'AI Study Assistant (Summarize, Quiz, Q&A)',
      flashcards: 'Flashcards',
      flashcardsTitle: 'SM-2 Spaced Repetition Flashcards',
      focus: 'Focus',
      focusTitle: 'Pomodoro Focus Timer & Study Stats',
      slides: 'Slides',
      slidesTitle: 'Import PDF Lecture Slides & Annotate',
    },
    canvas: {
      pen: 'Pen Tool',
      highlighter: 'Highlighter',
      eraser: 'Eraser',
      shapes: 'Geometric Shapes',
      laser: 'Laser Pointer',
      palmRejection: 'Palm Rejection',
      autoShape: 'Auto-Shape',
      clear: 'Clear Canvas',
      undo: 'Undo',
      redo: 'Redo',
      zoomIn: 'Zoom In',
      zoomOut: 'Zoom Out',
      resetView: 'Reset View',
      page: 'Page',
      addPage: 'Add Page',
    },
    sidebar: {
      workspaces: 'Workspaces',
      notebooks: 'Notebooks',
      notes: 'Notes',
      newNote: 'New Lecture Note',
      searchNotes: 'Filter notes by title or tag...',
      trash: 'Trash & Restore',
      storage: 'Storage Quota',
      backup: 'Backup & Restore',
    },
    actions: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      rename: 'Rename',
      duplicate: 'Duplicate',
      pin: 'Pin',
      unpin: 'Unpin',
      copy: 'Copy',
      copied: 'Copied!',
      reload: 'Reload',
      close: 'Close',
    },
  },
  si: {
    app: {
      title: 'ස්ක්‍රිබල්නෝට්',
      tagline: 'දේශන සඳහා සටහන් පොත: ලියන සටහන්, චිත්‍ර, ස්ලයිඩ සහ ශ්‍රව්‍ය එකම තැනක.',
      guest: 'ආගන්තුක මාදිලිය',
      pro: 'ප්‍රෝ',
      searchPlaceholder: 'ක්‍රියා සහ සෙවීම...',
      quickSearch: 'සොයන්න...',
    },
    navigation: {
      feed: 'ප්‍රවාහය',
      notes: 'සටහන්',
      split: 'ද්විත්ව',
      canvas: 'කැන්වසය',
      export: 'අපනයනය',
      history: 'පෙර සංස්කරණ',
      shortcuts: 'කෙටිමං',
      fullscreen: 'සම්පූර්ණ තිරය',
      themeDark: 'අඳුරු මාදිලිය',
      themeLight: 'දීප්තිමත් මාදිලිය',
    },
    sync: {
      synced: 'සමමුහුර්තයි',
      syncing: 'සමමුහුර්ත වෙමින්...',
      offline: 'නොබැඳි',
      conflict: 'ගැටුමක්',
      error: 'දෝෂයකි',
    },
    studyHub: {
      aiStudy: 'AI අධ්‍යයනය',
      aiTitle: 'AI අධ්‍යයන සහායක (සාරාංශ, ප්‍රශ්නාවලි, පිළිතුරු)',
      flashcards: 'ෆ්ලෑෂ් කාඩ්පත්',
      flashcardsTitle: 'SM-2 ෆ්ලෑෂ් කාඩ්පත් මගින් පාඩම් කිරීම',
      focus: 'අවධානය',
      focusTitle: 'පොමෝඩෝරෝ අවධානය සහ අධ්‍යයන කාලසටහන',
      slides: 'ස්ලයිඩ',
      slidesTitle: 'PDF ස්ලයිඩ ආයාත කර සටහන් ලියන්න',
    },
    canvas: {
      pen: 'පෑන',
      highlighter: 'හයිලයිටරය',
      eraser: 'මකනය',
      shapes: 'හැඩතල',
      laser: 'ලේසර් දර්ශකය',
      palmRejection: 'අත්ල නොසලකා හැරීම',
      autoShape: 'ස්වයංක්‍රීය හැඩය',
      clear: 'කැන්වසය හිස් කරන්න',
      undo: 'ආපසු',
      redo: 'යළි කරන්න',
      zoomIn: 'විශාල කරන්න',
      zoomOut: 'කුඩා කරන්න',
      resetView: 'මුල් ප්‍රමාණය',
      page: 'පිටුව',
      addPage: 'නව පිටුවක්',
    },
    sidebar: {
      workspaces: 'වැඩබිම්',
      notebooks: 'පොත්',
      notes: 'සටහන්',
      newNote: 'නව දේශන සටහනක්',
      searchNotes: 'සටහන් සොයන්න...',
      trash: 'කසළ බඳුන',
      storage: 'ඉඩ ප්‍රමාණය',
      backup: 'උපස්ථ සහ ප්‍රතිසාධනය',
    },
    actions: {
      save: 'සුරකින්න',
      cancel: 'අවලංගු කරන්න',
      delete: 'මකන්න',
      rename: 'නම වෙනස් කරන්න',
      duplicate: 'පිටපත් කරන්න',
      pin: 'පින් කරන්න',
      unpin: 'අන්පින් කරන්න',
      copy: 'පිටපත්',
      copied: 'පිටපත් විය!',
      reload: 'යළි පූරණය',
      close: 'වසන්න',
    },
  },
  ta: {
    app: {
      title: 'ஸ்கிரிபிள்நோட்',
      tagline: 'விரிவுரைகளுக்கான நோட்புக்: தட்டச்சு, கையெழுத்து, ஸ்லைடுகள் மற்றும் ஆடியோ ஒரே இடத்தில்.',
      guest: 'விருந்தினர் முறை',
      pro: 'ப்ரோ',
      searchPlaceholder: 'விரைவான செயல்கள் மற்றும் தேடல்...',
      quickSearch: 'தேடு...',
    },
    navigation: {
      feed: 'ஊட்டம்',
      notes: 'குறிப்புகள்',
      split: 'பிரிப்பு',
      canvas: 'வரைபலகை',
      export: 'ஏற்றுமதி',
      history: 'பதிப்பு வரலாறு',
      shortcuts: 'விசைப்பலகை குறுக்குவழிகள்',
      fullscreen: 'முழுத்திரை',
      themeDark: 'இருண்ட பயன்முறை',
      themeLight: 'ஒளி பயன்முறை',
    },
    sync: {
      synced: 'ஒத்திசைக்கப்பட்டது',
      syncing: 'ஒத்திசைக்கிறது...',
      offline: 'ஆஃப்லைன்',
      conflict: 'முரண்பாடு',
      error: 'ஒத்திசைவு பிழை',
    },
    studyHub: {
      aiStudy: 'AI படிப்பு',
      aiTitle: 'AI படிப்பு உதவியாளர் (சுருக்கம், வினாடி வினா, கேள்வி பதில்)',
      flashcards: 'ஃபிளாஷ்கார்டுகள்',
      flashcardsTitle: 'SM-2 இடைவெளி நினைவூட்டல் அட்டைகள்',
      focus: 'கவனம்',
      focusTitle: 'போமோடோரோ டைமர் & படிப்பு புள்ளிவிவரங்கள்',
      slides: 'ஸ்லைடுகள்',
      slidesTitle: 'PDF ஸ்லைடுகளை இறக்குமதி செய்து குறிப்பு எழுதுங்கள்',
    },
    canvas: {
      pen: 'பேனா கருவி',
      highlighter: 'ஹைலைட்டர்',
      eraser: 'அழிப்பான்',
      shapes: 'வடிவியல் வடிவங்கள்',
      laser: 'லேசர் சுட்டிக்காட்டி',
      palmRejection: 'உள்ளங்கை நிராகரிப்பு',
      autoShape: 'தானியங்கி வடிவம்',
      clear: 'அழிக்கவும்',
      undo: 'செயல்தவிர்',
      redo: 'மீண்டும் செய்',
      zoomIn: 'பெரிதாக்கு',
      zoomOut: 'சிறிதாக்கு',
      resetView: 'மீட்டமைக்க',
      page: 'பக்கம்',
      addPage: 'பக்கத்தைச் சேர்',
    },
    sidebar: {
      workspaces: 'பணிவெளிகள்',
      notebooks: 'நோட்புக்குகள்',
      notes: 'குறிப்புகள்',
      newNote: 'புதிய விரிவுரைக் குறிப்பு',
      searchNotes: 'குறிப்புகளைத் தேடுங்கள்...',
      trash: 'குப்பைத்தொட்டி',
      storage: 'சேமிப்பக ஒதுக்கீடு',
      backup: 'காப்புப்பிரதி மற்றும் மீட்டமைத்தல்',
    },
    actions: {
      save: 'சேமிக்க',
      cancel: 'ரத்துசெய்',
      delete: 'நீக்கு',
      rename: 'மறுபெயரிடு',
      duplicate: 'நகல் எடு',
      pin: 'பின் செய்',
      unpin: 'அன்பின் செய்',
      copy: 'நகலெடு',
      copied: 'நகலெடுக்கப்பட்டது!',
      reload: 'மீண்டும் ஏற்று',
      close: 'மூடு',
    },
  },
};
