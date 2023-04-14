import { FC, PropsWithChildren, useEffect, useState } from "react";
import { Theme, ThemeProvider } from "@mui/material/styles";
import useLocalStorage from "use-local-storage";
import { ThemeContext } from "./Context";
import type { TTheme } from "./types";
import dark from "./themes/dark";
import light from "./themes/light";

const themeMap: Record<TTheme, Theme> = {
  dark,
  light,
};

export const Provider: FC<
  PropsWithChildren<{
    initialTheme?: TTheme;
  }>
> = ({ children, initialTheme }) => {
  const [theme, setTheme] = useState<TTheme>(initialTheme || "dark");
  const [storedTheme, setStoredTheme] = useLocalStorage<TTheme>("theme", theme);
  useEffect(() => {
    if (storedTheme) {
      setTheme(storedTheme);
    }
  }, [storedTheme]);

  return (
    <ThemeContext.Provider value={{ setTheme: setStoredTheme, theme }}>
      <ThemeProvider theme={themeMap[theme]}>{children}</ThemeProvider>
    </ThemeContext.Provider>
  );
};
