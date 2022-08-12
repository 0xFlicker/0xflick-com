import { useEffect } from "react";
import useLocalStorage from "use-local-storage";

export enum ETheme {
  LIGHT = "light",
  DARK = "dark",
}

export function useSavedTheme() {
  return useLocalStorage("theme", ETheme.LIGHT, {
    syncData: true,
  });
}
export function useFancyMode() {
  return useLocalStorage("fancyMode", true, {
    syncData: true,
  });
}
