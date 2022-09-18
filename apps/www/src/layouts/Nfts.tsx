import { FC, useCallback, useState } from "react";
import MenuList from "@mui/material/MenuList";
import { useAppSelector } from "app/store";
import { Carousel } from "features/nft-collection/components/Carousel";
import { useGetNftCollectionQuery } from "features/nft-collection/api";
import { INfts } from "@0xflick/models";
import { Main } from "./Main";
import { useLocale } from "locales/hooks";
import { selectors as appbarSelectors } from "features/appbar/redux";
import { randomUint8ArrayOfLength } from "features/axolotlValley/hooks/useOffscreenCanvas";
import { SiteMenu } from "features/appbar/components/SiteMenu";

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
            <SiteMenu />
          </MenuList>
        </>
      }
    >
      <Carousel nfts={serverSideNfts || data} />
    </Main>
  );
};
