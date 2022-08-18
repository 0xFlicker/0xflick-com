import {
  Divider,
  ListItemText,
  MenuItem,
  MenuList,
  Typography,
} from "@mui/material";
import { DarkModeSwitch } from "features/appbar/components/DarkModeSwitch";
import { randomUint8ArrayOfLength } from "features/axolotlValley/hooks/useOffscreenCanvas";
import { useLocale } from "locales/hooks";
import { FC, useCallback, useState } from "react";
import { Main } from "./Main";
import { Share } from "@mui/icons-material";
import { CopyToClipboardMenuItem } from "components/CopyToClipboardMenuItem";
import { useFancyMode, useSavedTheme } from "features/appbar/hooks";
import { Hero } from "features/home/components/Hero";

export const Home: FC = () => {
  // const { t } = useLocale("common");
  // const onFlick = useCallback(() => {
  //   // nothing to do
  // }, []);
  // const { handleChange: handleThemeChange } = useSavedTheme();
  return <Hero />;
};
