import React, {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocales } from "expo-localization";
import { useSession } from "@/providers/session";
import { matchLanguage, resolveLanguage, setLanguage } from "@/i18n/core";

const storageKey = "yerbarium.app-language";
const ReadyContext = createContext(false);
export const useLocaleReady = () => useContext(ReadyContext);

export function LocaleProvider({ children }: React.PropsWithChildren) {
  const { user, ready: sessionReady } = useSession();
  const devices = useLocales();
  const [stored, setStored] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const deviceTags = devices.map((device) => device.languageTag).join(",");

  useEffect(() => {
    let active = true;
    void AsyncStorage.getItem(storageKey)
      .catch(() => null)
      .then((value) => {
        if (!active) return;
        setStored(value);
        setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const preference = user ? user.language_code : stored;
  const target = resolveLanguage(preference, deviceTags.split(","));
  useLayoutEffect(() => {
    if (!loaded || !sessionReady) return;
    let active = true;
    setLanguage(target);
    // This stores only a non-sensitive language preference, never account data.
    const saved = user
      ? matchLanguage(user.language_code)
      : matchLanguage(stored);
    void (
      saved
        ? AsyncStorage.setItem(storageKey, saved)
        : AsyncStorage.removeItem(storageKey)
    )
      .catch(() => undefined)
      .then(() => {
        if (active) setStored(saved);
      });
    return () => {
      active = false;
    };
  }, [loaded, sessionReady, user, stored, target]);

  return (
    <ReadyContext.Provider value={loaded && sessionReady}>
      {children}
    </ReadyContext.Provider>
  );
}
