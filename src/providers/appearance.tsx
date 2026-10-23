import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Appearance, useColorScheme } from "react-native";
import { ThemeProvider, DarkTheme, DefaultTheme } from "expo-router";
import { darkTheme, lightTheme } from "@/theme";
import { ThemeContext } from "@/theme/context";
import {
  appearanceStorageKey,
  parseAppearance,
  resolveAppearance,
  type AppearancePreference,
} from "@/preferences/appearance";

const Context = createContext<null | {
  ready: boolean;
  preference: AppearancePreference;
  pending: boolean;
  error: boolean;
  chooseAppearance: (next: AppearancePreference) => void;
}>(null);
export function useAppearance() {
  const value = useContext(Context);
  if (!value) throw new Error("AppearanceProvider missing");
  return value;
}
export function AppearanceProvider({ children }: React.PropsWithChildren) {
  const system = useColorScheme();
  const [preference, setPreference] = useState<AppearancePreference>("system");
  const [ready, setReady] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);
  const saving = useRef(false);
  const scheme = resolveAppearance(preference, system);
  useEffect(() => {
    let active = true;
    void AsyncStorage.getItem(appearanceStorageKey)
      .then((value) => {
        if (active) setPreference(parseAppearance(value));
      })
      .catch(() => {})
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    Appearance.setColorScheme(
      preference === "system" ? "unspecified" : preference,
    );
    return () => Appearance.setColorScheme("unspecified");
  }, [preference]);
  function chooseAppearance(next: AppearancePreference) {
    if (saving.current) return;
    saving.current = true;
    setPending(true);
    setError(false);
    setPreference(next);
    void AsyncStorage.setItem(appearanceStorageKey, next)
      .catch(() => setError(true))
      .finally(() => {
        saving.current = false;
        setPending(false);
      });
  }
  const theme = scheme === "dark" ? darkTheme : lightTheme;
  const navigationTheme = React.useMemo(
    () => ({
      ...(theme.dark ? DarkTheme : DefaultTheme),
      colors: {
        ...(theme.dark ? DarkTheme : DefaultTheme).colors,
        primary: theme.colors.green,
        background: theme.colors.background,
        card: theme.colors.surface,
        text: theme.colors.ink,
        border: theme.colors.subtleBorder,
        notification: theme.colors.error,
      },
    }),
    [theme],
  );
  return (
    <Context.Provider
      value={{ ready, preference, pending, error, chooseAppearance }}
    >
      <ThemeContext.Provider value={theme}>
        <ThemeProvider value={navigationTheme}>{children}</ThemeProvider>
      </ThemeContext.Provider>
    </Context.Provider>
  );
}
