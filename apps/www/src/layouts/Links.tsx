import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import MenuList from "@mui/material/MenuList";
import Typography from "@mui/material/Typography";
import { useLocale } from "@0xflick/feature-locale";
import { FC } from "react";
import { Main } from "./Main";
import { useTheme } from "@0xflick/feature-theme";
import { LinkCollection } from "@0xflick/components/src/LinkCollection";
import { SiteMenu } from "features/appbar/components/SiteMenu";

const defaultCardMediaProps = {
  component: "img",
  height: "240",
  sx: {
    objectFit: "contain",
    px: 2,
  },
};
const defaultGridBreakpoints = {
  xs: 12,
  sm: 12,
  md: 6,
  lg: 3,
  xl: 2,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

export const Links: FC = () => {
  const { t } = useLocale(["common"]);
  const { toggleTheme: handleThemeChange, isDarkMode } = useTheme();
  return (
    <Main
      menu={
        <>
          <MenuList dense disablePadding>
            <SiteMenu isLinks />
          </MenuList>
        </>
      }
      title={
        <Typography variant="h5" component="h1">
          {t("title_links")}
        </Typography>
      }
    >
      <Container
        maxWidth={false}
        sx={{
          mt: 4,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            alignContent: "center",
          }}
        >
          <LinkCollection isDarkMode={isDarkMode} />
        </Box>
      </Container>
    </Main>
  );
};
