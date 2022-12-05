import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import InputIcon from "@mui/icons-material/Input";
import { DarkModeSwitch } from "features/appbar/components/DarkModeSwitch";
import { useLocale } from "@0xflick/feature-locale";
import { FC } from "react";
import { useSavedTheme } from "features/appbar/hooks";
import ListItemIcon from "@mui/material/ListItemIcon";
import { WrappedLink } from "components/WrappedLink";

export const SiteMenu: FC<{
  // Yeah need to do a real sitemap and route stuff...
  isDemo?: boolean;
  isFaq?: boolean;
  isLinks?: boolean;
  isSignup?: boolean;
}> = ({ isDemo = false, isFaq = false, isLinks = false, isSignup = false }) => {
  const { t } = useLocale(["common"]);
  const { handleChange: handleThemeChange, isDarkMode } = useSavedTheme();
  return (
    <>
      <MenuItem component={WrappedLink} href="/demo" disabled={isDemo}>
        <ListItemIcon>
          <InputIcon />
        </ListItemIcon>
        <ListItemText
          primary={<Typography textAlign="right">{t("menu_demo")}</Typography>}
        />
      </MenuItem>
      <MenuItem component={WrappedLink} href="/faq" disabled={isFaq}>
        <ListItemIcon>
          <InputIcon />
        </ListItemIcon>
        <ListItemText
          primary={<Typography textAlign="right">{t("menu_faq")}</Typography>}
        />
      </MenuItem>
      <MenuItem component={WrappedLink} href="/links" disabled={isLinks}>
        <ListItemIcon>
          <InputIcon />
        </ListItemIcon>
        <ListItemText
          primary={<Typography textAlign="right">{t("menu_links")}</Typography>}
        />
      </MenuItem>
      <MenuItem onClick={handleThemeChange}>
        <DarkModeSwitch isDarkMode={isDarkMode} />
        <ListItemText
          primary={
            <Typography textAlign="right" flexGrow={1}>
              {t("menu_theme", { ns: "common" })}
            </Typography>
          }
        />
      </MenuItem>
    </>
  );
};
