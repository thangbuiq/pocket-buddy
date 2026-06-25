"use client";

import {
  createContext,
  useEffect,
  useContext,
  useSyncExternalStore,
  ReactNode,
} from "react";
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

// Default values for SSR
const DEFAULT_LANGUAGE: Language = "vi";
const DEFAULT_CURRENCY: Currency = "VND";

// External store for localStorage
function createLocalStorageStore<T>(
  key: string,
  defaultValue: T,
  validator: (v: string | null) => T | null,
) {
  const listeners = new Set<() => void>();
  let hydrated = false;
  let currentValue = defaultValue;

  return {
    subscribe(callback: () => void) {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
    getSnapshot(): T {
      return currentValue;
    },
    hydrate() {
      if (hydrated || typeof window === "undefined") return;
      hydrated = true;
      const stored = validator(localStorage.getItem(key)) ?? defaultValue;
      if (stored === currentValue) return;
      currentValue = stored;
      listeners.forEach((cb) => cb());
    },
    set(value: T) {
      currentValue = value;
      localStorage.setItem(key, String(value));
      listeners.forEach((cb) => cb());
    },
  };
}

const languageStore = createLocalStorageStore<Language>(
  "pocket-buddy-language",
  DEFAULT_LANGUAGE,
  (v) => (v === "vi" || v === "en" ? v : null),
);

const currencyStore = createLocalStorageStore<Currency>(
  "pocket-buddy-currency",
  DEFAULT_CURRENCY,
  (v) => (v === "VND" || v === "USD" ? v : null),
);

export function I18nProvider({ children }: { children: ReactNode }) {
  const language = useSyncExternalStore(
    languageStore.subscribe,
    languageStore.getSnapshot,
    languageStore.getSnapshot,
  );
  const currency = useSyncExternalStore(
    currencyStore.subscribe,
    currencyStore.getSnapshot,
    currencyStore.getSnapshot,
  );

  useEffect(() => {
    languageStore.hydrate();
    currencyStore.hydrate();
  }, []);

  const setLanguage = (lang: Language) => languageStore.set(lang);
  const setCurrency = (curr: Currency) => currencyStore.set(curr);

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
