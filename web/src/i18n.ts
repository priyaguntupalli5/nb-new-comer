import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { en } from "./locales/en";
import { fr } from "./locales/fr";

export const LANGUAGES = ["en", "fr"] as const;
export type Language = (typeof LANGUAGES)[number];

const STORAGE_KEY = "nbg.language";

function savedLanguage(): Language {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "en" || saved === "fr") return saved;
  } catch {
    // Storage can be blocked; fall back to English.
  }
  return "en";
}

i18n.on("languageChanged", (lng) => {
  document.documentElement.lang = lng;
  try {
    localStorage.setItem(STORAGE_KEY, lng);
  } catch {
    // Not critical: the choice just won't persist.
  }
});

void i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, fr: { translation: fr } },
  lng: savedLanguage(),
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
