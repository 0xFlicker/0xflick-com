import { FC, useCallback, useState } from "react";
import { ListItemText, MenuItem, MenuList, Typography } from "@mui/material";
import { useAppSelector } from "app/store";
import { Carousel } from "features/nft-collection/components/Carousel";
import { useGetNftCollectionQuery } from "features/nft-collection/api";
import { INfts } from "@0xflick/models";
import { Main } from "./Main";
import { DarkModeSwitch } from "features/appbar/components/DarkModeSwitch";
import { useLocale } from "locales/hooks";
import { selectors as appbarSelectors } from "features/appbar/redux";
import { randomUint8ArrayOfLength } from "features/axolotlValley/hooks/useOffscreenCanvas";

export const Nfts: FC<{ serverSideNfts?: INfts[] }> = ({ serverSideNfts }) => {
  const { t } = useLocale("common");
  const isFancyMode = useAppSelector(appbarSelectors.fancyMode);
  const [seed, setSeed] = useState<Uint8Array>(randomUint8ArrayOfLength(32));
  const onFlick = useCallback(() => {
    const newSeed = randomUint8ArrayOfLength(32);
    setSeed(newSeed);
  }, []);
  const { data, isLoading, isError } = useGetNftCollectionQuery(undefined, {
    skip: !!serverSideNfts,
  });
  return (
    <Main
      onFlick={onFlick}
      menu={
        <>
          <MenuList dense disablePadding>
            <MenuItem>
              <DarkModeSwitch />
              <ListItemText
                primary={
                  <Typography textAlign="right" flexGrow={1}>
                    {t("menu_theme")}
                  </Typography>
                }
              />
            </MenuItem>
          </MenuList>
        </>
      }
    >
      <Carousel nfts={serverSideNfts || data} />
    </Main>
  );
};
