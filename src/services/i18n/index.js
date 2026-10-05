import React from "react";
import { initReactI18next } from "react-i18next";
import i18next from "i18next";

// Import translations
import uzTranslations from "../../translations/uz.json";
import ruTranslations from "../../translations/ru.json";
import enTranslations from "../../translations/en.json";

// Til har doim "uz" bilan boshlanadi (server va klient bir xil render qilishi uchun).
// Foydalanuvchi tanlagan til settings store'da saqlanadi va _app.js dagi
// LanguageSync uni mount'dan keyin i18n ga qo'llaydi — yagona manba: store.
i18next
  .use(initReactI18next)
  .init({
    resources: {
      uz: {
        translation: uzTranslations,
      },
      ru: {
        translation: ruTranslations,
      },
      en: {
        translation: enTranslations,
      },
    },
    lng: "uz",
    fallbackLng: "uz",
    keepPreviousData: false,
    debug: false,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18next;
