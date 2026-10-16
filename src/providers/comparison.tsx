import { tr, useLocale } from "@/i18n";
import React, { createContext, useContext, useState } from "react";
import { Alert } from "react-native";
const Context = createContext<{
  slugs: string[];
  toggle: (slug: string) => void;
  clear: () => void;
}>({ slugs: [], toggle: () => {}, clear: () => {} });
export function ComparisonProvider({ children }: React.PropsWithChildren) {
  useLocale();
  const [slugs, setSlugs] = useState<string[]>([]);
  function toggle(slug: string) {
    if (!slugs.includes(slug) && slugs.length === 4) {
      Alert.alert(
        tr("Hasta cuatro yerbas"),
        tr("Quitá una para agregar otra."),
      );
      return;
    }
    setSlugs((value) =>
      value.includes(slug) ? value.filter((s) => s !== slug) : [...value, slug],
    );
  }
  return (
    <Context.Provider value={{ slugs, toggle, clear: () => setSlugs([]) }}>
      {children}
    </Context.Provider>
  );
}
export const useComparison = () => useContext(Context);
