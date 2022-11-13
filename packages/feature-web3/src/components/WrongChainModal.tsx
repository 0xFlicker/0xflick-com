import { FC, forwardRef } from "react";
import {
  Backdrop,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  Typography,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import { useLocale } from "locales/hooks";
import Fade from "@mui/material/Fade";

interface IProps {
  open: boolean;
  chainName: string;
  handleClose: () => void;
  handleChangeNetwork: () => void;
}

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Fade in={props.appear} ref={ref} {...props} />;
});

export const WrongChainModal: FC<IProps> = ({
  open,
  chainName,
  handleClose,
  handleChangeNetwork,
}) => {
  const { t } = useLocale("common");
  return (
    <Dialog
      aria-labelledby="modal-wrong-chain-title"
      aria-describedby="modal-wrong-chain-description"
      open={open}
      TransitionComponent={Transition}
      onClose={handleClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
    >
      <DialogTitle id="modal-wrong-chain-title">
        {t("modal_wrong_chain_title")}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ textAlign: "center" }}>
          <Typography id="modal-wrong-chain-description">
            {t("modal_wrong_chain_description", { chainName })}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button color="secondary" onClick={handleClose}>
          {t("button_cancel")}
        </Button>
        <Button color="primary" onClick={handleChangeNetwork}>
          {t("button_switch_chain")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
