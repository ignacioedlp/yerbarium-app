import argentinianSpanish from "./es-AR.json";
import english from "./en.json";
import brazilianPortuguese from "./pt-BR.json";
import spanish from "./es.json";
import portuguese from "./pt.json";

export const supportedLanguages = ["es", "es-AR", "pt", "pt-BR", "en"] as const;
export type AppLanguage = (typeof supportedLanguages)[number];
export type TranslationParams = Record<
  string,
  string | number | null | undefined
>;
export const messages: Record<AppLanguage, Record<string, string>> = {
  es: spanish,
  "es-AR": {
    ...Object.fromEntries(Object.keys(english).map((key) => [key, key])),
    ...argentinianSpanish,
  },
  pt: { ...brazilianPortuguese, ...portuguese },
  "pt-BR": brazilianPortuguese,
  en: english,
};
const locales: Record<AppLanguage, string> = {
  es: "es-ES",
  "es-AR": "es-AR",
  pt: "pt-PT",
  "pt-BR": "pt-BR",
  en: "en-GB",
};

export function matchLanguage(value?: string | null): AppLanguage | null {
  if (!value) return null;
  const normalized = value.trim().replace(/_/g, "-").toLowerCase();
  if (/^es-ar(?:-|$)/.test(normalized)) return "es-AR";
  if (/^pt-br(?:-|$)/.test(normalized)) return "pt-BR";
  const base = normalized.split("-")[0];
  return base === "es" || base === "pt" || base === "en" ? base : null;
}
export function resolveLanguage(
  preference: string | null | undefined,
  deviceLanguages: readonly string[],
): AppLanguage {
  return (
    matchLanguage(preference) ??
    deviceLanguages.map(matchLanguage).find((value) => value !== null) ??
    "es-AR"
  );
}
export function translate(
  language: AppLanguage,
  message: string,
  params: TranslationParams = {},
): string {
  const translated = Object.hasOwn(messages[language], message)
    ? messages[language][message]
    : message;
  return translated.replace(/\{(\w+)\}/g, (placeholder, name: string) =>
    Object.hasOwn(params, name) ? String(params[name] ?? "") : placeholder,
  );
}
let currentLanguage: AppLanguage = "es-AR";
const listeners = new Set<() => void>();
export const getLanguage = () => currentLanguage;
export const getLocale = () => locales[currentLanguage];
export function setLanguage(language: AppLanguage) {
  if (language === currentLanguage) return;
  currentLanguage = language;
  listeners.forEach((notify) => notify());
}
export function subscribeLanguage(notify: () => void) {
  listeners.add(notify);
  return () => {
    listeners.delete(notify);
  };
}
/** Translate app-owned messages only; never translate user text or product names. */
export const tr = (message: string, params?: TranslationParams) =>
  translate(currentLanguage, message, params);
export function countLabel(count: number, singular: string, plural: string) {
  // Hermes builds may omit Intl.PluralRules. These are the cardinal rules
  // for the five supported locales; catalog counts are non-negative integers.
  const category =
    typeof Intl.PluralRules === "function"
      ? new Intl.PluralRules(getLocale()).select(count)
      : count === 1 || (getLanguage() === "pt-BR" && count === 0)
        ? "one"
        : "other";
  return tr(category === "one" ? singular : plural, {
    count: count.toLocaleString(getLocale()),
  });
}
