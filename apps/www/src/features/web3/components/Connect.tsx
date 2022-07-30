import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "app/store";
import { FC, useCallback, useMemo, useRef, useState } from "react";
import { useLocale } from "locales/hooks";
import { actions as web3Actions, selectors as web3Selectors } from "../redux";
import { selectors as configSelectors } from "features/config";
import { WalletModal } from "./WalletModal";
import { WrongChainModal } from "./WrongChainModal";
import { ConnectedDropDownModal } from "./ConnectedDropDownModal";

const Connect: FC = () => {
  const { t } = useLocale("common");
  const dispatch = useAppDispatch();
  const [connectedMenuOpen, setConnectedMenuOpen] = useState(false);
  const onClick = useCallback(() => {
    dispatch(web3Actions.openWalletSelectModal());
  }, [dispatch]);

  const handleDisconnect = useCallback(() => {
    dispatch(web3Actions.reset());
    setConnectedMenuOpen(false);
  }, [dispatch]);
  const [underConnectedButtonCoordinates, setUnderConnectedButtonCoordinates] =
    useState({
      top: 0,
      left: 0,
      width: 0,
    });

  const connectedButtonRef = useCallback((node?: HTMLButtonElement) => {
    if (node !== null) {
      const rect = node.getBoundingClientRect();
      setUnderConnectedButtonCoordinates({
        top: rect.bottom,
        left: rect.left,
        width: rect.width,
      });
    }
  }, []);
  const handleConnectedMenuClose = useCallback(() => {
    setConnectedMenuOpen(false);
  }, [setConnectedMenuOpen]);
  const chainName = useAppSelector(configSelectors.chainName);
  const isOpen = useAppSelector(web3Selectors.isWalletSelectModalOpen);
  const isWrongNetwork = useAppSelector(web3Selectors.isWrongNetwork);
  const selectedAddress = useAppSelector(web3Selectors.address);

  const handleModalClose = useCallback(() => {
    dispatch(web3Actions.closeWalletSelectModal());
  }, [dispatch]);
  const handleMetamask = useCallback(() => {
    dispatch(web3Actions.connectMetamask());
    dispatch(web3Actions.closeWalletSelectModal());
  }, [dispatch]);
  const handleWalletConnect = useCallback(() => {
    dispatch(web3Actions.connectWalletConnect());
    dispatch(web3Actions.closeWalletSelectModal());
  }, [dispatch]);
  const handleChangeNetworkAbort = useCallback(() => {
    dispatch(web3Actions.reset());
  }, [dispatch]);
  const handleSwitchNetwork = useCallback(() => {
    dispatch(web3Actions.switchChain());
  }, [dispatch]);

  return (
    <>
      {selectedAddress ? (
        <Button
          ref={connectedButtonRef}
          variant="outlined"
          sx={{
            m: "0.5rem",
          }}
          onClick={() => setConnectedMenuOpen(true)}
        >
          <Typography
            component="span"
            sx={{
              fontSize: "0.8rem",
              fontWeight: "bold",
              textTransform: "none",
              textOverflow: "ellipsis",
              overflow: "hidden",
              whiteSpace: "nowrap",
              px: "1rem",
              py: "0.5rem",
              maxWidth: "12rem",
            }}
          >
            {selectedAddress}
          </Typography>
        </Button>
      ) : (
        <Button onClick={onClick}>{t("button_connect")}</Button>
      )}
      <WalletModal
        open={isOpen}
        handleClose={handleModalClose}
        handleMetamask={handleMetamask}
        handleWalletConnect={handleWalletConnect}
      />
      <WrongChainModal
        chainName={chainName}
        open={isWrongNetwork}
        handleClose={handleChangeNetworkAbort}
        handleChangeNetwork={handleSwitchNetwork}
      />
      <ConnectedDropDownModal
        open={connectedMenuOpen}
        handleClose={handleConnectedMenuClose}
        handleDisconnect={handleDisconnect}
        top={underConnectedButtonCoordinates.top}
        left={underConnectedButtonCoordinates.left}
        width={underConnectedButtonCoordinates.width}
      />
    </>
  );
};

export { Connect };
