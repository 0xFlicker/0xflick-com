import Box from "@mui/material/Box";
import MenuList from "@mui/material/MenuList";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { FC } from "react";
import { Main } from "./Main";
import { ResolverFormDemo } from "features/resolver/components/ResolverFormDemo";
import { SiteMenu } from "features/appbar/components/SiteMenu";
import { useLocale } from "locales/hooks";

export const Demo: FC = () => {
  const { t } = useLocale(["common"]);
  return (
    <Main
      menu={
        <>
          <MenuList dense disablePadding>
            <SiteMenu isDemo />
          </MenuList>
        </>
      }
      title={
        <Typography variant="h5" component="h1">
          {t("title_demo")}
        </Typography>
      }
    >
      <Container maxWidth="sm">
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignContent="center"
          height="100vh"
        >
          <ResolverFormDemo />
        </Box>
      </Container>
    </Main>
  );
};
