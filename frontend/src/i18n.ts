import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Импорт переводов
import translationRU from './locales/ru/translation.json';

// Ресурсы для переводов
const resources = {
  ru: {
    translation: translationRU
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ru', // Язык по умолчанию
    fallbackLng: 'ru',
    interpolation: {
      escapeValue: false // React уже обрабатывает XSS
    }
  });

export default i18n;