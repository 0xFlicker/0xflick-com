import Head from "next/head";
import { DefaultProvider } from "@/context/default";
import { NextPage } from "next";
import Box from "@mui/material/Box";
import MenuList from "@mui/material/MenuList";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { Main } from "@/layouts/Main";
import { SiteMenu } from "@/features/appbar/components/SiteMenu";
import { useLocale } from "@0xflick/feature-locale";
import { MintCard } from "@/features/wrap/components/MintCard";
import useClient from "@/hooks/useClient";
import Grid2 from "@mui/material/Unstable_Grid2";
import { FC, useEffect, useState } from "react";
import { wagmiClientAutoConnect } from "@0xflick/feature-web3/src/wagmi";
import { BetaTurboWrap } from "@/features/wrap/components/BetaTurboWrap";
import { BetaWrapCard } from "@/features/wrap/components/BetaWrapCard";
import { UnwrapCard } from "@/features/wrap/components/UnWrapCard";
import useLocalStorage from "use-local-storage";
import { AgreeModal } from "@/features/wrap/components/AgreeModal";
import { Success } from "../features/wrap/components/Success";

const TestSuccessPage: NextPage<{}> = () => {
  const { t } = useLocale(["common"]);
  const [tokenIds, setTokenIds] = useState<string[]>([]);
  const [txHash, setTxHash] = useState<string>("");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenIds = urlParams.get("tokenIds")?.split(",") || [];
    const txHash = urlParams.get("txHash") || "";
    setTokenIds(tokenIds);
    setTxHash(txHash);
  }, []);
  return (
    <DefaultProvider wagmiClient={wagmiClientAutoConnect.get()}>
      <Head>
        <title>Fame Lady Society Wrap</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Main
        menu={
          <>
            <MenuList dense disablePadding>
              <SiteMenu isWrap />
            </MenuList>
          </>
        }
        title={
          <Typography variant="h5" component="h1" marginLeft={2}>
            {t("title_wrap")}
          </Typography>
        }
      >
        <Success txHash={txHash} tokenIds={tokenIds} />
      </Main>
    </DefaultProvider>
  );
};
export default TestSuccessPage;
