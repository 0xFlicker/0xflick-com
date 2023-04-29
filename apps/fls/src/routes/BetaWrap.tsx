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
import { FC, useEffect } from "react";
import { wagmiClientAutoConnect } from "@0xflick/feature-web3/src/wagmi";
import { BetaTurboWrap } from "@/features/wrap/components/BetaTurboWrap";
import { BetaWrapCard } from "@/features/wrap/components/BetaWrapCard";
import { UnwrapCard } from "@/features/wrap/components/UnWrapCard";
import useLocalStorage from "use-local-storage";
import { AgreeModal } from "@/features/wrap/components/AgreeModal";

const Content: FC<{
  hasMint?: boolean;
}> = ({ hasMint = true }) => {
  const isClient = useClient();
  const [hasAgreed, setHasAgreed] = useLocalStorage("agree-to-risk", false);
  return (
    <>
      <Container maxWidth="lg">
        <Grid2 container spacing={2}>
          {hasMint ? (
            <Grid2 xs={12} sm={12} md={12}>
              <Box component="div" sx={{ mt: 4 }}>
                {isClient && <MintCard />}
              </Box>
            </Grid2>
          ) : null}
          <Grid2 xs={12} sm={12} md={12}>
            <Box component="div" sx={{ mt: 4 }}>
              {isClient && <BetaTurboWrap />}
            </Box>
          </Grid2>
          <Grid2 xs={12} sm={12} md={12}>
            <Box component="div" sx={{ mt: 4 }}>
              {isClient && <BetaWrapCard minTokenId={0} maxTokenId={8887} />}
            </Box>
          </Grid2>
          <Grid2 xs={12} sm={12} md={12}>
            <Box component="div" sx={{ mt: 4 }}>
              {isClient && <UnwrapCard />}
            </Box>
          </Grid2>
        </Grid2>
      </Container>
      {!hasAgreed && (
        <AgreeModal open={!hasAgreed} onClose={() => setHasAgreed(true)} />
      )}
    </>
  );
};

const FaqPage: NextPage<{
  hasMint?: boolean;
}> = ({ hasMint = true }) => {
  const { t } = useLocale(["common"]);

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
        <Content hasMint={hasMint} />
      </Main>
    </DefaultProvider>
  );
};
export default FaqPage;
