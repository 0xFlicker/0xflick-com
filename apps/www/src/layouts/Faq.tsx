import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { DarkModeSwitch } from "features/appbar/components/DarkModeSwitch";
import { useLocale } from "locales/hooks";
import { FC } from "react";
import { Main } from "./Main";
import { useSavedTheme } from "features/appbar/hooks";
import { useMint } from "features/mint/hooks";
import { useHasAllowedAction } from "features/auth/hooks";
import { canPreSaleMint } from "features/auth/matchers";
import { ResolverFormDemo } from "features/resolver/components/ResolverFormDemo";
import Box from "@mui/material/Box";
import { FAQ } from "features/home/components/FAQ";

export const Faq: FC = () => {
  const { t } = useLocale(["common"]);
  useMint();
  const { handleChange: handleThemeChange } = useSavedTheme();
  return (
    <Main
      menu={
        <>
          <MenuList dense disablePadding>
            <MenuItem onClick={handleThemeChange}>
              <DarkModeSwitch />
              <ListItemText
                primary={
                  <Typography textAlign="right" flexGrow={1}>
                    {t("menu_theme", { ns: "common" })}
                  </Typography>
                }
              />
            </MenuItem>
          </MenuList>
        </>
      }
      title={
        <Typography variant="h5" component="h1">
          {t("faq_title")}
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
