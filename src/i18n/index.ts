import { useSyncExternalStore } from "react";
import { getLanguage, subscribeLanguage } from "./core";
export { tr, countLabel, getLocale, getLanguage } from "./core";
export function useLocale() {
  return useSyncExternalStore(subscribeLanguage, getLanguage, getLanguage);
}
