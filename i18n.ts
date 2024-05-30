import i18n from 'i18next';
import Backend from 'i18next-fs-backend';
import { LanguageDetector } from 'i18next-http-middleware';

// Configure i18next with filesystem backend and language detector
i18n
  .use(Backend) // Use the filesystem backend
  .use(LanguageDetector) // Use the HTTP middleware language detector
  .init({
    backend: {
      loadPath: './locales/{{lng}}/translation.json', // Path to the translation files
    },
    fallbackLng: 'en', // Default language if no other is detected or specified
    preload: ['en', 'fr'], // Preload English and French languages on initialization
  });

export default i18n;
