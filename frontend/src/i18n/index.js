import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import enTranslations from './locales/en.json';
import hiTranslations from './locales/hi.json';
import knTranslations from './locales/kn.json';
import taTranslations from './locales/ta.json';
import teTranslations from './locales/te.json';
import mrTranslations from './locales/mr.json';
import bnTranslations from './locales/bn.json';

const resources = {
    en: { translation: enTranslations },
    hi: { translation: hiTranslations },
    kn: { translation: knTranslations },
    ta: { translation: taTranslations },
    te: { translation: teTranslations },
    mr: { translation: mrTranslations },
    bn: { translation: bnTranslations }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: 'en',
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
