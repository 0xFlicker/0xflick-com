import { ListItemText, MenuItem, MenuList } from "@mui/material";
import { useAppSelector } from "app/store";
import { DarkModeSwitch } from "features/appbar/components/DarkModeSwitch";
import { FancyModeSwitch } from "features/appbar/components/FancyModeSwitch";
import { randomUint8ArrayOfLength } from "features/axolotlValley/hooks/useOffscreenCanvas";
import { PleaseAxolotl } from "features/home/components/PleaseAxolotl";
import { useLocale } from "locales/hooks";
import { FC, useCallback, useState } from "react";
import { selectors as appbarSelectors } from "features/appbar/redux";
import { Main } from "./Main";
import { Preview } from "features/axolotlValley/components/Preview";
import { useRouter } from "next/router";
import { BigNumber, utils } from "ethers";

export const Seed: FC<{ seed: Uint8Array }> = ({ seed }) => {
  const { t } = useLocale("common");
  const isFancyMode = useAppSelector(appbarSelectors.fancyMode);
  const router = useRouter();
  const onFlick = useCallback(() => {
    const newSeed = randomUint8ArrayOfLength(32);
    const newSeedStr = utils.hexlify(newSeed);
    router.push("/seed/[seedId]", `/seed/${newSeedStr}`);
  }, [router]);
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
      {isFancyMode ? <PleaseAxolotl seed={seed} /> : <Preview seed={seed} />}
    </Main>
  );
};
