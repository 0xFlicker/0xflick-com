import Box from "@mui/material/Box";
import MenuList from "@mui/material/MenuList";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { FC } from "react";
import { Main } from "./Main";
import { useMint } from "features/mint/hooks";
import { FAQ } from "features/home/components/FAQ";
import { SiteMenu } from "features/appbar/components/SiteMenu";
import { useLocale } from "@0xflick/feature-locale";

export const Faq: FC = () => {
  const { t } = useLocale(["common"]);
  useMint();
  return (
    <Main
      menu={
        <>
          <MenuList dense disablePadding>
            <SiteMenu isFaq />
          </MenuList>
        </>
      }
      title={
        <Typography variant="h5" component="h1">
          {t("title_faq")}
        </Typography>
      }
    >
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <FAQ />
        </Box>
      </Container>
    </Main>
  );
};
