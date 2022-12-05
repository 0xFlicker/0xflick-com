import { Box, Typography, CircularProgress } from "@mui/material";
import { useLocale } from "@0xflick/feature-locale";
import { FC } from "react";
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { useAuth } from "features/auth/hooks";
import { useWeb3 } from "@0xflick/feature-web3";

export const ConnectedStatus: FC = () => {
  const { t } = useLocale("common");
  const { provider, selectedAddress } = useWeb3();
  const isConnected = provider && selectedAddress;
  return (
    <Box display="flex" flexDirection="row">
      {isConnected ? (
        <>
          <CheckCircleIcon />
          <Typography marginLeft={1}>
            {t("approve_must_be_connected")}
          </Typography>
        </>
      ) : (
        <>
          <CancelIcon />
          <Typography marginLeft={1}>
            {t("approve_must_be_connected")}
          </Typography>
        </>
      )}
    </Box>
  );
};
