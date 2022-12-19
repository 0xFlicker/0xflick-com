import { FC } from "react";
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import Typography from "@mui/material/Typography";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import ProfileIcon from "@mui/icons-material/AccountCircle";
import { useLocale } from "@0xflick/feature-locale";
import { WrappedLink } from "@0xflick/components/src/WrappedLink";
import { ListItem } from "@mui/material";

interface IProps {
  anchorEl: Element;
  handleClose: () => void;
  handleDisconnect: () => void;
  handleLogin: () => void;
  handleLogout: () => void;
  isLoggedIn: boolean;
}

export const ConnectedDropDownModal: FC<IProps> = ({
  anchorEl,
  handleClose,
  handleDisconnect,
  handleLogin,
  handleLogout,
  isLoggedIn,
}) => {
  const { t } = useLocale("common");
  const open = Boolean(anchorEl);
  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      onClose={handleClose}
      keepMounted
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
    >
      <Box sx={{ width: 320 }}>
        <MenuList disablePadding>
          {isLoggedIn ? (
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography textAlign="right">
                    {t("auth_button_logout")}
                  </Typography>
                }
              />
            </MenuItem>
          ) : (
            <MenuItem onClick={handleLogin}>
              <ListItemIcon>
                <LoginIcon />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography textAlign="right">
                    {t("auth_button_login")}
                  </Typography>
                }
              />
            </MenuItem>
          )}
          {!isLoggedIn && (
            <MenuItem onClick={handleDisconnect}>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography textAlign="right">
                    {t("connect_disconnect")}
                  </Typography>
                }
              />
            </MenuItem>
          )}
          {isLoggedIn && (
            <MenuItem component={WrappedLink} href="/profile">
              <ListItemIcon>
                <ProfileIcon />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography textAlign="right">{t("profile")}</Typography>
                }
              />
            </MenuItem>
          )}
        </MenuList>
      </Box>
    </Menu>
  );
};
