import Container from "@mui/material/Container";
import Grid2 from "@mui/material/Unstable_Grid2";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import Typography from "@mui/material/Typography";
import { DarkModeSwitch } from "features/appbar/components/DarkModeSwitch";
import { useLocale } from "locales/hooks";
import { FC } from "react";
import { Main } from "./Main";
import { useSavedTheme } from "features/appbar/hooks";
import { useHasAllowedAction } from "features/auth/hooks";
import { canPreSaleMint } from "features/auth/matchers";
import { LinkCard } from "../components/LinkCard";
import { useAppSelector } from "app/store";
import { selectors as appBarSelectors } from "features/appbar/redux";
import Box from "@mui/material/Box";

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
          {t("links_title")}
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
          <Grid2 container spacing={4}>
            <Grid2 {...defaultGridBreakpoints}>
              <LinkCard
                headerTitle="demo"
                content={
                  <Typography color="text.secondary" sx={{ height: 80 }}>
                    Instant ENS resolution demo
                  </Typography>
                }
                CardMediaProps={{
                  ...defaultCardMediaProps,
                  image: `/marketing/demo-${isDarkMode ? "dark" : "light"}.png`,
                }}
                to="/demo"
              />
            </Grid2>
            <Grid2 {...defaultGridBreakpoints}>
              <LinkCard
                headerTitle="signup for nameflick"
                content={
                  <Typography color="text.secondary" sx={{ height: 80 }}>
                    Sign up for Nameflick
                  </Typography>
                }
                CardMediaProps={{
                  ...defaultCardMediaProps,
                  image: `/marketing/presale-signup-${
                    isDarkMode ? "dark" : "light"
                  }.png`,
                }}
                to="/signup/premint/from-links"
              />
            </Grid2>
            <Grid2 {...defaultGridBreakpoints}>
              <LinkCard
                headerTitle="GitHub: open source"
                content={
                  <Typography color="text.secondary" sx={{ height: 80 }}>
                    Look at what&apos;s under the hood
                  </Typography>
                }
                CardMediaProps={{
                  ...defaultCardMediaProps,
                  image: `/marketing/github-${
                    isDarkMode ? "dark" : "light"
                  }.png`,
                }}
                to="https://github.com/nameflick"
              />
            </Grid2>
            <Grid2 {...defaultGridBreakpoints}>
              <LinkCard
                headerTitle="social: Twitter"
                content={
                  <Typography color="text.secondary" sx={{ height: 80 }}>
                    Official Twitter account
                  </Typography>
                }
                CardMediaProps={{
                  ...defaultCardMediaProps,
                  image: `/marketing/twitter-${
                    isDarkMode ? "dark" : "light"
                  }.png`,
                }}
                to="https://twitter.com/NameflickENS"
              />
            </Grid2>
            <Grid2 {...defaultGridBreakpoints}>
              <LinkCard
                headerTitle="social: Discord"
                content={
                  <Typography color="text.secondary" sx={{ height: 80 }}>
                    Invite link: If you see this you are early
                  </Typography>
                }
                CardMediaProps={{
                  ...defaultCardMediaProps,
                  image: `/marketing/discord-${
                    isDarkMode ? "dark" : "light"
                  }.png`,
                }}
                to="https://discord.gg/GE3zFDU8aU"
              />
            </Grid2>
            <Grid2 {...defaultGridBreakpoints}>
              <LinkCard
                headerTitle="FAQ"
                content={
                  <Typography color="text.secondary" sx={{ height: 80 }}>
                    Frequently asked questions
                  </Typography>
                }
                CardMediaProps={{
                  ...defaultCardMediaProps,
                  image: `/marketing/faq-${isDarkMode ? "dark" : "light"}.png`,
                }}
                to="/faq"
              />
            </Grid2>
          </Grid2>
        </Box>
      </Container>
    </Main>
  );
};
