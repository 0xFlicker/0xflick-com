import { useContext, useCallback } from "react";
import { ThemeContext } from "./Context";
import type { TTheme } from "./types";

export const useTheme = () => {
  const { theme, setTheme } = useContext(ThemeContext);
  return {
    theme,
    isDarkMode: theme === "dark",
    setTheme: useCallback(
      (theme: TTheme) => {
        // Set a "theme" cookie with a 10 year expiry
        document.cookie = `theme=${theme};max-age=${60 * 60 * 24 * 365 * 10}`;
        setTheme(theme);
      },
      [setTheme]
    ),
    toggleTheme: useCallback(() => {
      setTheme(theme === "dark" ? "light" : "dark");
    }, [setTheme, theme]),
  };
};
