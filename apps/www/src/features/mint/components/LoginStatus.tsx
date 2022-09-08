import { Box, Typography, CircularProgress } from "@mui/material";
import { useLocale } from "locales/hooks";
import { FC } from "react";
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { useAuth } from "features/auth/hooks";

export const LoginStatus: FC = () => {
  const { t } = useLocale("common");
  const {
    isAnonymous,
    isAuthenticated,
    isUserWaiting,
    isUserSigningMessage,
    isUserRequestingSignIn,
  } = useAuth();
  const isCurrentlyLoading =
    isUserWaiting || isUserRequestingSignIn || isUserSigningMessage;
  // Must have something to show.....
  const leftHandContent = (() => {
    if (isCurrentlyLoading) {
      return <CircularProgress size={24} />;
    }
    if (!isAuthenticated) {
      return <CancelIcon />;
    }
    return <CheckCircleIcon />;
  })();
  return (
    <Box display="flex" flexDirection="row">
      {leftHandContent}
      <Typography marginLeft={1}>{t("approve_auth_logged_in")}</Typography>
    </Box>
  );
};
