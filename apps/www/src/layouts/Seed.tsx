import {
  Divider,
  ListItemText,
  MenuItem,
  MenuList,
  Typography,
} from "@mui/material";
import { useAppSelector } from "app/store";
import { DarkModeSwitch } from "features/appbar/components/DarkModeSwitch";
import { FancyModeSwitch } from "features/appbar/components/FancyModeSwitch";
import { randomUint8ArrayOfLength } from "features/axolotlValley/hooks/useOffscreenCanvas";
import { PleaseAxolotl } from "features/home/components/PleaseAxolotl";
import { useLocale } from "locales/hooks";
import { FC, useCallback, useState } from "react";
import { Share } from "@mui/icons-material";
import { Main } from "./Main";
import { Preview } from "features/axolotlValley/components/Preview";
import { useRouter } from "next/router";
import { utils } from "ethers";
import { useSavedTheme, useFancyMode } from "features/appbar/hooks";
import { CopyToClipboardMenuItem } from "components/CopyToClipboardMenuItem";

export const Seed: FC<{ seed?: Uint8Array }> = ({ seed }) => {
  const { t } = useLocale("common");
  const router = useRouter();
  const onFlick = useCallback(() => {
    const newSeed = randomUint8ArrayOfLength(32);
    const newSeedStr = utils.hexlify(newSeed);
    router.push(`/seed/${newSeedStr}`);
  }, [router]);
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
              text={`${process.env.NEXT_PUBLIC_IMAGE_RESIZER}/seed/${
                seed && utils.hexlify(seed)
              }`}
            >
              <Typography textAlign="right" flexGrow={1}>
                {t("menu_share")}
              </Typography>
            </CopyToClipboardMenuItem>
            <Divider />
            <MenuItem onClick={handleThemeChange}>
              <ListItemText primary={t("menu_theme")} />
              <DarkModeSwitch />
            </MenuItem>
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
