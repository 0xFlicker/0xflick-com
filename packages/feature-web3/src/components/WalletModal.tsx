import { FC, useCallback } from "react";
import { Backdrop, Box, Button, Grid, Modal, Typography } from "@mui/material";
import Image from "next/image";
import { Fade } from "../transitions/Fade";
import { useLocale } from "@0xflick/feature-locale";
import { useConnect } from "wagmi";
import {
  isCoinbaseWalletConnector,
  isInjectedConnector,
  isMetamaskConnector,
  isWalletConnector,
  TAppConnectors,
} from "../wagmi";

interface IProps {
  assetPrefix?: string;
  open: boolean;
  handleClose: () => void;
}

export const WalletModal: FC<IProps> = ({ assetPrefix, open, handleClose }) => {
  const { t } = useLocale("common");
  const { connect, error, isLoading, connectors } = useConnect({
    onSettled: handleClose,
  });
  const handleMetamask = useCallback(() => {
    const connector = connectors.find((c) => {
      return isMetamaskConnector(c as TAppConnectors);
    });
    if (connector) {
      connect({
        connector,
      });
    }
  }, [connect]);

  const handleWalletConnect = useCallback(() => {
    const connector = connectors.find((c) => {
      return isWalletConnector(c as TAppConnectors);
    });
    if (connector) {
      connect({
        connector,
      });
    }
  }, [connect]);

  const handleCoinbaseConnect = useCallback(() => {
    const connector = connectors.find((c) => {
      return isCoinbaseWalletConnector(c as TAppConnectors);
    });
    if (connector) {
      connect({
        connector,
      });
    }
  }, [connect]);

  const handleFrameConnect = useCallback(() => {
    const connector = connectors.find((c) => {
      return isInjectedConnector(c as TAppConnectors);
    });
    if (connector) {
      connect({
        connector,
      });
    }
  }, [connect]);
  return (
    <Modal
      keepMounted
      aria-labelledby="modal-wallet-title"
      aria-describedby="modal-wallet-description"
      open={open}
      onClose={handleClose}
      closeAfterTransition
    >
      <Fade in={open}>
        <Box
          sx={{
            position: "absolute" as "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography id="modal-wallet-title" variant="h6" component="h2">
            {t("modal_connect_title")}
          </Typography>
          <Typography id="modal-wallet-description" sx={{ mt: 2 }}>
            {t("modal_connect_description")}
          </Typography>
          <Grid
            container
            spacing={0}
            direction="column"
            alignItems="center"
            justifyContent="center"
            style={{ marginTop: "2rem" }}
          >
            <Grid item style={{ marginTop: "1rem" }}>
              <Button
                onClick={handleMetamask}
                variant="outlined"
                startIcon={
                  <Image
                    alt=""
                    src={`${assetPrefix ?? ""}/wallets/metamask-fox.svg`}
                    width={25}
                    height={25}
                  />
                }
              >
                {t("button_metamask")}
              </Button>
            </Grid>
            <Grid item style={{ marginTop: "1rem" }}>
              <Button
                onClick={handleWalletConnect}
                variant="outlined"
                startIcon={
                  <Image
                    alt=""
                    src={`${assetPrefix ?? ""}/wallets/walletconnect.svg`}
                    width={25}
                    height={25}
                  />
                }
              >
                {t("button_walletconnect")}
              </Button>
            </Grid>
            <Grid item style={{ marginTop: "1rem" }}>
              <Button
                onClick={handleCoinbaseConnect}
                variant="outlined"
                startIcon={
                  <Image
                    alt=""
                    src={`${assetPrefix ?? ""}/wallets/coinbase_wallet.png`}
                    width={25}
                    height={25}
                  />
                }
              >
                {t("button_coinbase_wallet")}
              </Button>
            </Grid>
            <Grid item style={{ marginTop: "1rem" }}>
              <Button
                onClick={handleFrameConnect}
                variant="outlined"
                startIcon={
                  <Image
                    alt=""
                    src={`${assetPrefix ?? ""}/wallets/FrameLogo512.png`}
                    width={25}
                    height={25}
                  />
                }
              >
                {t("button_frame_wallet")}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Fade>
    </Modal>
  );
};
