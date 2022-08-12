import { ListItemText, MenuItem, MenuList } from "@mui/material";
import { DarkModeSwitch } from "features/appbar/components/DarkModeSwitch";
import { FancyModeSwitch } from "features/appbar/components/FancyModeSwitch";
import { Preview } from "features/axolotlValley/components/Preview";
import { randomUint8ArrayOfLength } from "features/axolotlValley/hooks/useOffscreenCanvas";
import { Please } from "features/home/components/Please";
import { PleaseAxolotl } from "features/home/components/PleaseAxolotl";
import { useLocale } from "locales/hooks";
import { FC, useCallback, useState } from "react";
import { Main } from "./Main";

export const AxolotlValley: FC = () => {
  const { t } = useLocale("common");
  const [seed, setSeed] = useState<Uint8Array>(randomUint8ArrayOfLength(32));
  const onFlick = useCallback(() => {
    setSeed(randomUint8ArrayOfLength(32));
  }, []);
  return (
    <Main
      onFlick={onFlick}
      menu={
        <>
          <MenuList dense disablePadding>
            <MenuItem>
              <ListItemText primary={t("menu_theme")} />
              <DarkModeSwitch />
            </MenuItem>
          </MenuList>
          <MenuList dense disablePadding>
            <MenuItem>
              <ListItemText primary={t("menu_fancy")} />
              <FancyModeSwitch />
            </MenuItem>
          </MenuList>
        </>
      }
    >
      <Preview seed={seed} />
    </Main>
  );
};
