import { Button, ButtonProps, Typography } from "@mui/material";
import { useAppDispatch, useAppSelector } from "app/store";
import { CheckCircle as CheckCircleIcon } from "@mui/icons-material";
import { FC, useCallback, useState, MouseEvent } from "react";
import { useLocale } from "locales/hooks";
import { actions as authActions } from "features/auth";
import { actions as web3Actions, selectors as web3Selectors } from "../redux";
import { selectors as configSelectors } from "features/config";
import { WalletModal } from "./WalletModal";
import { WrongChainModal } from "./WrongChainModal";
import { ConnectedDropDownModal } from "./ConnectedDropDownModal";
import { useAuth } from "features/auth/hooks";

const Connect: FC<{
  size?: ButtonProps["size"];
}> = ({ size }) => {
  const { t } = useLocale("common");
  const dispatch = useAppDispatch();
  const { isAuthenticated, signIn, signOut } = useAuth();
  const [menuAnchorEl, setMenuAnchorEl] = useState<Element | null>(null);

  const onClick = useCallback(() => {
    dispatch(web3Actions.openWalletSelectModal());
  }, [dispatch]);

  const handleDisconnect = useCallback(() => {
    dispatch(web3Actions.reset());
    signOut();
    setMenuAnchorEl(null);
  }, [dispatch, signOut]);

  const onMenuClose = useCallback(() => {
    setMenuAnchorEl(null);
  }, []);
  const handleMenu = useCallback((event: MouseEvent) => {
    setMenuAnchorEl(event.currentTarget);
  }, []);
  const chainName = useAppSelector(configSelectors.chainName);
  const isOpen = useAppSelector(web3Selectors.isWalletSelectModalOpen);
  const isWrongNetwork = useAppSelector(web3Selectors.isWrongNetwork);
  const selectedAddress = useAppSelector(web3Selectors.address);

  const handleLogin = useCallback(() => {
    setMenuAnchorEl(null);
    signIn();
  }, [signIn]);
  const handleLogout = useCallback(() => {
    setMenuAnchorEl(null);
    dispatch(web3Actions.reset());
    signOut();
  }, [dispatch, signOut]);
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
          startIcon={isAuthenticated ? <CheckCircleIcon /> : null}
          variant="outlined"
          size={size}
          sx={{
            m: "0.5rem",
          }}
          onClick={handleMenu}
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
        anchorEl={menuAnchorEl}
        handleClose={onMenuClose}
        handleDisconnect={handleDisconnect}
        handleLogin={handleLogin}
        handleLogout={handleLogout}
        isLoggedIn={isAuthenticated}
      />
    </>
  );
};

export { Connect };
