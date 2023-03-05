import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import InputIcon from "@mui/icons-material/Input";
import { DarkModeSwitch } from "features/appbar/components/DarkModeSwitch";
import { useLocale } from "@0xflick/feature-locale";
import { FC } from "react";
import { useTheme } from "@0xflick/feature-theme";
import ListItemIcon from "@mui/material/ListItemIcon";
import { WrappedLink } from "@0xflick/components/src/WrappedLink";

export const SiteMenu: FC<{
  // Yeah need to do a real sitemap and route stuff...
  isRegister?: boolean;
  isFaq?: boolean;
  isLinks?: boolean;
}> = ({ isRegister = false, isFaq = false, isLinks = false }) => {
  const { t } = useLocale(["common"]);
  const { toggleTheme: handleThemeChange, isDarkMode } = useTheme();
  return (
    <>
      <MenuItem component={WrappedLink} href="/register" disabled={isRegister}>
        <ListItemIcon>
          <InputIcon />
        </ListItemIcon>
        <ListItemText
          primary={
            <Typography textAlign="right">{t("menu_register")}</Typography>
          }
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
