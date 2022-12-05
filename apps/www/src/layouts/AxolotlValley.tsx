import { FC, useCallback, useState } from "react";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import { FancyModeSwitch } from "features/appbar/components/FancyModeSwitch";
import { SiteMenu } from "features/appbar/components/SiteMenu";
import { useFancyMode } from "features/appbar/hooks";
import { Preview } from "features/axolotlValley/components/Preview";
import { randomUint8ArrayOfLength } from "features/axolotlValley/hooks/useOffscreenCanvas";
import { PleaseAxolotl } from "features/home/components/PleaseAxolotl";
import { useLocale } from "@0xflick/feature-locale";
import { Main } from "./Main";

export const AxolotlValley: FC = () => {
  const { t } = useLocale("common");
  const [seed, setSeed] = useState<Uint8Array>(randomUint8ArrayOfLength(32));
  const onFlick = useCallback(() => {
    setSeed(randomUint8ArrayOfLength(32));
  }, []);

  const { isFancyMode, handleChange: handleFancyChange } = useFancyMode();

  return (
    <Main
      onFlick={onFlick}
      menu={
        <>
          <SiteMenu />
          <MenuList dense disablePadding>
            <MenuItem onClick={handleFancyChange}>
              <ListItemText primary={t("menu_fancy")} />
              <FancyModeSwitch />
            </MenuItem>
          </MenuList>
        </>
      }
    >
      {isFancyMode ? <PleaseAxolotl seed={seed} /> : <Preview seed={seed} />}
    </Main>
  );
};
