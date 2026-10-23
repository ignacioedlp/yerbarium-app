import { createContext, useContext, useMemo } from "react";
import { lightTheme, type AppTheme } from "./palettes";

export const ThemeContext = createContext<AppTheme>(lightTheme);
export function useTheme() {
  return useContext(ThemeContext);
}
export function useThemedStyles<T>(create: (theme: AppTheme) => T): T {
  const theme = useTheme();
  return useMemo(() => create(theme), [create, theme]);
}
