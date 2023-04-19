import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import InputIcon from "@mui/icons-material/Input";
import QAIcon from "@mui/icons-material/QuestionAnswer";
import ExchangeIcon from "@mui/icons-material/CurrencyExchange";
import { DarkModeSwitch } from "@/features/appbar/components/DarkModeSwitch";
import { useLocale } from "@0xflick/feature-locale";
import { FC } from "react";
import { useTheme } from "@0xflick/feature-theme";
import ListItemIcon from "@mui/material/ListItemIcon";
import { WrappedLink } from "@0xflick/components/src/WrappedLink";

export const SiteMenu: FC<{
  isFaq?: boolean;
  isHome?: boolean;
  isWrap?: boolean;
}> = ({ isHome = false, isFaq = false, isWrap = false }) => {
  const { t } = useLocale(["common"]);
  return (
    <>
      <MenuItem component={WrappedLink} href="/wrap" disabled={isWrap}>
        <ListItemIcon>
          <ExchangeIcon />
        </ListItemIcon>
        <ListItemText
          primary={<Typography textAlign="right">(testnet) Wrap</Typography>}
        />
      </MenuItem>
      <MenuItem component={WrappedLink} href="/faq" disabled={isFaq}>
        <ListItemIcon>
          <QAIcon />
        </ListItemIcon>
        <ListItemText
          primary={<Typography textAlign="right">FAQ</Typography>}
        />
      </MenuItem>
      <MenuItem component={WrappedLink} href="/" disabled={isHome}>
        <ListItemIcon>
          <InputIcon />
        </ListItemIcon>
        <ListItemText
          primary={<Typography textAlign="right">{t("menu_home")}</Typography>}
        />
      </MenuItem>
    </>
  );
};
