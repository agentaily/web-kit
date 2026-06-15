import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactElement, ReactNode } from "react";
import { isBrowser } from "../internal/env";
import { createStorage } from "../persistence/createStorage";
import { persistentState } from "../persistence/persistentState";
import type { StorageConfig } from "../persistence/types";

const LOCALE_KEY = "locale";

export interface CreateI18nConfig<TCatalogs extends Record<string, unknown>> {
  /** Per-product message catalogs, keyed by locale. The mechanism is shared;
   * the catalogs are injected by each product. */
  catalogs: TCatalogs;
  /** Fallback locale when nothing is persisted and detection fails. */
  defaultLocale: keyof TCatalogs & string;
  /** Persistence configuration (shared cross-subdomain cookie by default). */
  storage?: StorageConfig;
  /** Apply `<html lang>` on locale change. Default `true`. */
  setHtmlLang?: boolean;
}

export interface LocaleContextValue<TLocale extends string, TMessages> {
  locale: TLocale;
  setLocale(locale: TLocale): void;
  locales: TLocale[];
  messages: TMessages;
}

export interface LocaleProviderProps<TLocale extends string> {
  children: ReactNode;
  /** Override the fallback locale for this subtree. */
  defaultLocale?: TLocale;
}

export interface I18nApi<TCatalogs extends Record<string, unknown>> {
  LocaleProvider: (props: LocaleProviderProps<keyof TCatalogs & string>) => ReactElement;
  useLocale: () => {
    locale: keyof TCatalogs & string;
    setLocale: (locale: keyof TCatalogs & string) => void;
    locales: (keyof TCatalogs & string)[];
  };
  /** Messages for the active locale, typed to the injected catalog shape. */
  useMessages: () => TCatalogs[keyof TCatalogs];
}

/** Resolve the initial locale: persisted → navigator.language → fallback. */
function detectLocale<T extends string>(stored: T | null, locales: T[], fallback: T): T {
  if (stored && locales.includes(stored)) return stored;
  if (isBrowser() && typeof navigator !== "undefined" && navigator.language) {
    const nav = navigator.language.toLowerCase();
    for (const locale of locales) {
      if (locale.toLowerCase() === nav) return locale;
    }
    const primary = nav.split("-")[0] ?? nav;
    for (const locale of locales) {
      if (locale.toLowerCase() === primary) return locale;
    }
  }
  return fallback;
}

/**
 * Factory: the i18n *mechanism* is shared; each product injects its own catalogs.
 * Returns a `LocaleProvider` plus `useLocale` / `useMessages` hooks bound to the
 * catalog's types (compile-time safety — `useMessages()` matches the catalog shape).
 */
export function createI18n<TCatalogs extends Record<string, unknown>>(
  config: CreateI18nConfig<TCatalogs>,
): I18nApi<TCatalogs> {
  type TLocale = keyof TCatalogs & string;
  type TMessages = TCatalogs[keyof TCatalogs];

  const locales = Object.keys(config.catalogs) as TLocale[];
  const applyHtmlLang = config.setHtmlLang ?? true;
  const Context = createContext<LocaleContextValue<TLocale, TMessages> | null>(null);

  function LocaleProvider({ children, defaultLocale }: LocaleProviderProps<TLocale>): ReactElement {
    const state = useMemo(
      () =>
        persistentState<TLocale | null>({
          key: LOCALE_KEY,
          defaultValue: null,
          storage: createStorage(config.storage),
          decode: (raw) => (locales.includes(raw as TLocale) ? (raw as TLocale) : undefined),
          encode: (value) => String(value),
        }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [],
    );

    const [locale, setLocaleState] = useState<TLocale>(() =>
      detectLocale(state.get(), locales, defaultLocale ?? config.defaultLocale),
    );

    useEffect(() => {
      if (applyHtmlLang && isBrowser()) document.documentElement.setAttribute("lang", locale);
    }, [locale]);

    const setLocale = useCallback(
      (next: TLocale): void => {
        setLocaleState(next);
        state.set(next);
      },
      [state],
    );

    const messages = config.catalogs[locale] as TMessages;

    const value = useMemo<LocaleContextValue<TLocale, TMessages>>(
      () => ({ locale, setLocale, locales, messages }),
      [locale, setLocale, messages],
    );

    return createElement(Context.Provider, { value }, children);
  }

  function useLocaleContext(): LocaleContextValue<TLocale, TMessages> {
    const ctx = useContext(Context);
    if (ctx === null) {
      throw new Error("useLocale / useMessages must be used within a <LocaleProvider>");
    }
    return ctx;
  }

  return {
    LocaleProvider,
    useLocale: () => {
      const { locale, setLocale, locales: available } = useLocaleContext();
      return { locale, setLocale, locales: available };
    },
    useMessages: () => useLocaleContext().messages,
  };
}
