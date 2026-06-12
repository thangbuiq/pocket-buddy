"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import {
  translations,
  type Language,
  type TranslationKey,
} from "./translations";

export type Currency = "VND" | "USD";

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  currency: Currency;
  setCurrency: (curr: Currency) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

function getInitialLanguage(): Language {
  if (typeof window === "undefined") return "en";
  const saved = localStorage.getItem(
    "pocket-buddy-language",
  ) as Language | null;
  if (saved && (saved === "vi" || saved === "en")) {
    return saved;
  }
  return "en";
}

function getInitialCurrency(): Currency {
  if (typeof window === "undefined") return "VND";
  const saved = localStorage.getItem(
    "pocket-buddy-currency",
  ) as Currency | null;
  if (saved && (saved === "VND" || saved === "USD")) {
    return saved;
  }
  return "VND";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);
  const [currency, setCurrencyState] = useState<Currency>(getInitialCurrency);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("pocket-buddy-language", lang);
  };

  const setCurrency = (curr: Currency) => {
    setCurrencyState(curr);
    localStorage.setItem("pocket-buddy-currency", curr);
  };

  const t = (key: TranslationKey): string => {
    return translations[language][key] || key;
  };

  return (
    <I18nContext.Provider
      value={{ language, setLanguage, currency, setCurrency, t }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return context;
}

export function useCurrency() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useCurrency must be used within I18nProvider");
  }
  return { currency: context.currency, setCurrency: context.setCurrency };
}
