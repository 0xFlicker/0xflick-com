import { FC } from "react";
import {
  Backdrop,
  Box,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  MenuList,
  Typography,
} from "@mui/material";
import { Logout as LogoutIcon, Login as LoginIcon } from "@mui/icons-material";
import { useLocale } from "locales/hooks";

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
            <MenuItem>
              <ListItemButton onClick={handleLogout}>
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
              </ListItemButton>
            </MenuItem>
          ) : (
            <MenuItem>
              <ListItemButton onClick={handleLogin}>
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
              </ListItemButton>
            </MenuItem>
          )}
          {!isLoggedIn && (
            <MenuItem>
              <ListItemButton onClick={handleDisconnect}>
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
              </ListItemButton>
            </MenuItem>
          )}
        </MenuList>
      </Box>
    </Menu>
  );
};
