import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import Typography from "@mui/material/Typography";
import { useLocale } from "locales/hooks";
import { FC } from "react";
import { Main } from "./Main";
import { useSavedTheme } from "features/appbar/hooks";
import { useAppSelector } from "app/store";
import { selectors as appBarSelectors } from "features/appbar/redux";
import { LinkCollection } from "components/LinkCollection";
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
  const isDarkMode = useAppSelector(appBarSelectors.darkMode);
  const { handleChange: handleThemeChange } = useSavedTheme();
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
          <LinkCollection />
        </Box>
      </Container>
    </Main>
  );
};
