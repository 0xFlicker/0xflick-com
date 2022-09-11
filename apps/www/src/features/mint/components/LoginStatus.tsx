import { Box, Typography, CircularProgress } from "@mui/material";
import { useLocale } from "locales/hooks";
import { FC } from "react";
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { useAuth } from "features/auth/hooks";
import { StatusField } from "components/StatusField";

export const LoginStatus: FC = () => {
  const { t } = useLocale("common");
  const {
    isAuthenticated,
    isUserWaiting,
    isUserSigningMessage,
    isUserRequestingSignIn,
  } = useAuth();
  const isCurrentlyLoading =
    isUserWaiting || isUserRequestingSignIn || isUserSigningMessage;
  // Must have something to show.....
  return (
    <StatusField
      currentlyLoading={isCurrentlyLoading}
      checked={isAuthenticated}
    >
      {t("approve_auth_logged_in")}
    </StatusField>
  );
};
