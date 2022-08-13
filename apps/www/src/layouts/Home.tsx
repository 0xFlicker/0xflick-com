import {
  Divider,
  ListItemText,
  MenuItem,
  MenuList,
  Typography,
} from "@mui/material";
import { DarkModeSwitch } from "features/appbar/components/DarkModeSwitch";
import { FancyModeSwitch } from "features/appbar/components/FancyModeSwitch";
import { randomUint8ArrayOfLength } from "features/axolotlValley/hooks/useOffscreenCanvas";
import { PleaseAxolotl } from "features/home/components/PleaseAxolotl";
import { useLocale } from "locales/hooks";
import { FC, useCallback, useState } from "react";
import { Main } from "./Main";
import { Preview } from "features/axolotlValley/components/Preview";
import { utils } from "ethers";
import { Share } from "@mui/icons-material";
import { CopyToClipboardMenuItem } from "components/CopyToClipboardMenuItem";
import { useFancyMode, useSavedTheme } from "features/appbar/hooks";

export const Home: FC = () => {
  const { t } = useLocale("common");
  const [seed, setSeed] = useState<Uint8Array>(randomUint8ArrayOfLength(32));
  const onFlick = useCallback(() => {
    const newSeed = randomUint8ArrayOfLength(32);
    setSeed(newSeed);
  }, []);
  const { handleChange: handleThemeChange } = useSavedTheme();
  const { isFancyMode, handleChange: handleFancyChange } = useFancyMode();
  return (
    <Main
      onFlick={onFlick}
      menu={
        <>
          <MenuList dense disablePadding>
            <CopyToClipboardMenuItem
              icon={<Share />}
              text={`https://0xflick.com/seed/${utils.hexlify(seed)}`}
            >
              <Typography textAlign="right" flexGrow={1}>
                {t("menu_share")}
              </Typography>
            </CopyToClipboardMenuItem>
            <Divider />
            <MenuItem onClick={handleThemeChange}>
              <DarkModeSwitch />
              <ListItemText
                primary={
                  <Typography textAlign="right" flexGrow={1}>
                    {t("menu_theme")}
                  </Typography>
                }
              />
            </MenuItem>
            <MenuItem onClick={handleFancyChange}>
              <FancyModeSwitch />
              <ListItemText
                primary={
                  <Typography textAlign="right" flexGrow={1}>
                    {t("menu_fancy")}
                  </Typography>
                }
              />
            </MenuItem>
          </MenuList>
        </>
      }
    >
      {isFancyMode ? <PleaseAxolotl seed={seed} /> : <Preview seed={seed} />}
    </Main>
  );
};
