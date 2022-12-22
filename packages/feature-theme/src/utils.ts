import { TTheme } from "./types";

const allThemes: { [key in TTheme]: boolean } = {
  light: true,
  dark: true,
};

export function isTheme(theme: string): theme is TTheme {
  return allThemes[theme as TTheme];
}
