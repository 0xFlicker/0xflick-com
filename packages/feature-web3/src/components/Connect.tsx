import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import Button, { ButtonProps } from "@mui/material/Button";
import { useAppDispatch, useAppSelector } from "@0xflick/app-store";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { FC, useCallback, useState, MouseEvent } from "react";
import { useLocale } from "@0xflick/feature-locale";
import {
  actions as web3Actions,
  selectors as web3Selectors,
  WalletType,
} from "../redux";
import { WalletModal } from "./WalletModal";
import { WrongChainModal } from "./WrongChainModal";
import { ConnectedDropDownModal } from "./ConnectedDropDownModal";
import { useAuth } from "@0xflick/feature-auth/src/hooks";
import { defaultChain } from "@0xflick/utils";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { useAccount } from "wagmi";
import { useWeb3 } from "../hooks";

const Connect: FC<{
  size?: ButtonProps["size"];
}> = ({ size }) => {
  const { t } = useLocale("common");
  // Used to lazy render the ENS name, to avoid hydration mismatch
  const [settleEnsName, setSettledEnsName] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const { isAuthenticated, signIn, signOut, ensName, ensNameIsLoading } =
    useAuth();
  const [menuAnchorEl, setMenuAnchorEl] = useState<Element | null>(null);
  const { selectedAddress: address, reset } = useWeb3();

  const onClick = useCallback(() => {
    dispatch(web3Actions.openWalletSelectModal());
  }, [dispatch]);

  const handleDisconnect = useCallback(() => {
    dispatch(web3Actions.reset());
    signOut();
    reset();
    setMenuAnchorEl(null);
  }, [dispatch, signOut]);

  const onMenuClose = useCallback(() => {
    setMenuAnchorEl(null);
  }, []);
  const handleMenu = useCallback((event: MouseEvent) => {
    setMenuAnchorEl(event.currentTarget);
  }, []);

  // const chainName = chain?.name;
  const isOpen = useAppSelector(web3Selectors.isWalletSelectModalOpen);
  const isWrongNetwork = useAppSelector(web3Selectors.isWrongNetwork);

  const currentChainName = defaultChain.get().name;
  const handleLogin = useCallback(() => {
    setMenuAnchorEl(null);
    signIn();
  }, [signIn]);
  const handleLogout = useCallback(() => {
    setMenuAnchorEl(null);
    dispatch(web3Actions.reset());
    signOut();
    reset();
  }, [dispatch, signOut]);
  const handleModalClose = useCallback(() => {
    dispatch(web3Actions.closeWalletSelectModal());
  }, [dispatch]);
  const handleChangeNetworkAbort = useCallback(() => {
    dispatch(web3Actions.reset());
  }, [dispatch]);

  return (
    <>
      {address ? (
        <Tooltip title={ensName ? ensName : address}>
          <Button
            startIcon={isAuthenticated ? <CheckCircleIcon /> : null}
            variant="outlined"
            size={size}
            sx={{
              m: "0.5rem",
            }}
            onClick={handleMenu}
          >
            {ensNameIsLoading ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  width: "12rem",
                }}
              >
                <CircularProgress size={30} />
              </Box>
            ) : (
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
                {ensName ? ensName : address}
              </Typography>
            )}
          </Button>
        </Tooltip>
      ) : (
        <Button onClick={onClick}>{t("button_connect")}</Button>
      )}
      <WalletModal open={isOpen} handleClose={handleModalClose} />
      {/* <WrongChainModal
        chainName={currentChainName}
        open={isWrongNetwork}
        handleClose={handleChangeNetworkAbort}
        handleChangeNetwork={handleSwitchNetwork}
      /> */}
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
