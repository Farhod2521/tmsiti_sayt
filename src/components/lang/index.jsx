import React, { useState, useEffect } from "react";
import { useSettingsStore } from "@/store";
import { get, toLower } from "lodash";

import { useTranslation } from "react-i18next";

const Lang = ({}) => {
  const { t, i18n } = useTranslation();
  const lang = useSettingsStore((state) => get(state, "lang", "uz"));
  const setLang = useSettingsStore((state) => get(state, "setLang", () => {}));
  const selectedLanguage = lang || "uz";

  const languages = ["uz", "en", "ru"];

  const handleLanguageChange = (event) => {
    setLang(event.target.value); // LanguageSync (_app.js) i18n ni almashtiradi
  };

  return (
    <div className="language-select relative cursor-pointer">
      <select
        id="languageSelect"
        value={selectedLanguage}
        onChange={handleLanguageChange}
      >
        {languages.map((language, index) => (
          <option key={index} value={language}>
            {language}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Lang;
