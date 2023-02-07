import Box from "@mui/material/Box";
import MenuList from "@mui/material/MenuList";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { FC } from "react";
import { Main } from "./Main";
import { SiteMenu } from "features/appbar/components/SiteMenu";
import { useLocale } from "@0xflick/feature-locale";
import { AirdropHack } from "@0xflick/feature-airdrop/src/AirdropHack";

export const Register: FC = () => {
  const { t } = useLocale(["common"]);
  return (
    <Main
      menu={
        <>
          <MenuList dense disablePadding>
            <SiteMenu isRegister />
          </MenuList>
        </>
      }
      title={
        <Typography variant="h5" component="h1">
          {t("title_register")}
        </Typography>
      }
    >
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <AirdropHack />
        </Box>
      </Container>
    </Main>
  );
};
