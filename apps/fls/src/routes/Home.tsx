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
import { CountDown } from "@/components/CountDown";
import NextImage from "next/image";

const FaqPage: NextPage<{}> = () => {
  const { t } = useLocale(["common"]);
  const title = "Fame Lady Society";
  const description = "Unstoppable";
  return (
    <DefaultProvider>
      <Head>
        <title>Fame Lady Society</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta property="og:site_name" content="#itsawrap" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta
          property="og:image"
          content="https://fameladysociety.com/images/fls-wrap.gif"
        />
        <meta property="twitter:title" content={title} />
        <meta property="twitter:description" content={description} />
        <meta content="verification" name="LR1011" />
        <meta
          property="twitter:image"
          content="https://fameladysociety.com/images/Flsociety_morg_mock.jpeg"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:creator" content="@FameLadySociety" />
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
            coming soon
          </Typography>
        }
      >
        <Container maxWidth="lg">
          <Box sx={{ mt: 4 }}>
            {/* image fill width and keep aspect ratio */}
            <NextImage
              src="/images/Flsociety_morg_mock.png"
              alt="hero"
              layout="responsive"
              width={1920}
              height={1080}
            />
          </Box>
          <Box sx={{ mt: 4 }}>
            <CountDown />
          </Box>
        </Container>
      </Main>
    </DefaultProvider>
  );
};
export default FaqPage;
