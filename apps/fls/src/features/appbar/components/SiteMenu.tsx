import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import InputIcon from "@mui/icons-material/Input";
import { DarkModeSwitch } from "@/features/appbar/components/DarkModeSwitch";
import { useLocale } from "@0xflick/feature-locale";
import { FC } from "react";
import { useTheme } from "@0xflick/feature-theme";
import ListItemIcon from "@mui/material/ListItemIcon";
import { WrappedLink } from "@0xflick/components/src/WrappedLink";

export const SiteMenu: FC<{
  // Yeah need to do a real sitemap and route stuff...
  isHome?: boolean;
}> = ({ isHome = false }) => {
  const { t } = useLocale(["common"]);
  const { toggleTheme: handleThemeChange, isDarkMode } = useTheme();
  return (
    <>
      <MenuItem component={WrappedLink} href="/" disabled={isHome}>
        <ListItemIcon>
          <InputIcon />
        </ListItemIcon>
        <ListItemText
          primary={<Typography textAlign="right">{t("menu_home")}</Typography>}
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
