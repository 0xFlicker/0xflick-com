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
import { WrapCard } from "@/features/wrap/components/WrapCard";

const FaqPage: NextPage<{}> = () => {
  const { t } = useLocale(["common"]);
  const isClient = useClient();
  return (
    <DefaultProvider>
      <Head>
        <title>Fame Lady Society Wrap</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Main
        menu={
          <>
            <MenuList dense disablePadding>
              <SiteMenu isHome />
            </MenuList>
          </>
        }
        title={
          <Typography variant="h5" component="h1" marginLeft={2}>
            {t("title_wrap")}
          </Typography>
        }
      >
        <Container maxWidth="lg">
          <Grid2 container spacing={2}>
            <Grid2 xs={12} sm={12} md={12}>
              <Box sx={{ mt: 4 }}>{isClient && <MintCard />}</Box>
            </Grid2>
            <Grid2 xs={12} sm={12} md={12}>
              <Box sx={{ mt: 4 }}>
                {isClient && <WrapCard minTokenId={0} maxTokenId={8887} />}
              </Box>
            </Grid2>
          </Grid2>
        </Container>
      </Main>
    </DefaultProvider>
  );
};
export default FaqPage;
