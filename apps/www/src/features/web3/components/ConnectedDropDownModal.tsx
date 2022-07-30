import { FC } from "react";
import {
  Backdrop,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Modal,
} from "@mui/material";
import { Logout as LogoutIcon, Login as LoginIcon } from "@mui/icons-material";
import { Fade } from "transitions/Fade";
import { useLocale } from "locales/hooks";

interface IProps {
  open: boolean;
  handleClose: () => void;
  handleDisconnect: () => void;
  top: number;
  left: number;
  width: number;
}

export const ConnectedDropDownModal: FC<IProps> = ({
  open,
  handleClose,
  handleDisconnect,
  top,
  left,
  width,
}) => {
  const { t } = useLocale("common");
  return (
    <Modal
      aria-labelledby="connected-drop-down-title"
      aria-describedby="connected-drop-down-description"
      open={open}
      onClose={handleClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
    >
      <Fade in={open}>
        <Box
          sx={{
            position: "absolute" as "absolute",
            top,
            left,
            width,
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            marginRight: "0.5rem",
          }}
        >
          <List>
            <ListItem disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  <LoginIcon />
                </ListItemIcon>
                <ListItemText primary={t("auth_button_login")} />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={handleDisconnect}>
                <ListItemIcon>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText primary={t("connect_disconnect")} />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Fade>
    </Modal>
  );
};
