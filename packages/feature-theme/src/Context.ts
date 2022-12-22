import { createContext } from "react";
import type { TTheme } from "./types";

export const ThemeContext = createContext({
  theme: "dark" as TTheme,
  setTheme: (theme: TTheme) => {},
});
