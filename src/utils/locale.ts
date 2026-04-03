export type LocaleCode =
  | 'en-US'
  | 'en-GB'
  | 'es-ES'
  | 'fr-FR'
  | 'de-DE'
  | 'it-IT'
  | 'pt-BR'
  | 'ja-JP'
  | 'zh-CN'
  | 'zh-TW'
  | 'ko-KR'
  | 'ar-SA'
  | 'ru-RU'
  | 'vi-VN'
  | 'th-TH'
  | 'id-ID'
  | 'hi-IN'
  | 'nl-NL'
  | 'pl-PL'
  | 'tr-TR';

export interface LocaleInfo {
  code: LocaleCode;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LOCALES: LocaleInfo[] = [
  { code: 'en-US', name: 'English (US)', nativeName: 'English', flag: '🇺🇸' },
  { code: 'en-GB', name: 'English (UK)', nativeName: 'English', flag: '🇬🇧' },
  { code: 'es-ES', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr-FR', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de-DE', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it-IT', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)', nativeName: 'Português', flag: '🇧🇷' },
  { code: 'ja-JP', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文', flag: '🇨🇳' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '繁體中文', flag: '🇹🇼' },
  { code: 'ko-KR', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'ar-SA', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'ru-RU', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'vi-VN', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'th-TH', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭' },
  { code: 'id-ID', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'hi-IN', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'nl-NL', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'pl-PL', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
  { code: 'tr-TR', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
];

export function detectBrowserLocale(): LocaleCode {
  const browserLang = navigator.language || (navigator as any).userLanguage;

  const exactMatch = SUPPORTED_LOCALES.find(
    locale => locale.code.toLowerCase() === browserLang.toLowerCase()
  );

  if (exactMatch) {
    return exactMatch.code;
  }

  const langCode = browserLang.split('-')[0];
  const partialMatch = SUPPORTED_LOCALES.find(
    locale => locale.code.split('-')[0].toLowerCase() === langCode.toLowerCase()
  );

  if (partialMatch) {
    return partialMatch.code;
  }

  return 'en-US';
}

export function getLocaleInfo(code: LocaleCode): LocaleInfo | undefined {
  return SUPPORTED_LOCALES.find(locale => locale.code === code);
}

export function formatLocaleForDisplay(code: LocaleCode): string {
  const locale = getLocaleInfo(code);
  return locale ? `${locale.flag} ${locale.name}` : code;
}
