import { Box, Typography, CircularProgress } from "@mui/material";
import { useLocale } from "@0xflick/feature-locale";
import { FC } from "react";
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { useIsFollowingQuery } from "../api";
import { useAuth } from "features/auth/hooks";

export const FollowStatus: FC = () => {
  const { t } = useLocale("common");
  const { isAuthenticated } = useAuth();
  const { isError, isFetching, isLoading, isSuccess, data } =
    useIsFollowingQuery();
  const isFollowed =
    isAuthenticated && isSuccess && "following" in data && data.following;
  const needsLogin = isSuccess && "needsLogin" in data && data.needsLogin;
  const isNotFollowed =
    !isAuthenticated || (isSuccess && "following" in data && !data.following);
  const isCurrentlyLoading = isLoading || isFetching;
  return (
    <>
      <Box display="flex" flexDirection="row">
        {isCurrentlyLoading && <CircularProgress size={24} />}
        {!isCurrentlyLoading && (needsLogin || isError) && <CancelIcon />}
        {!isCurrentlyLoading && !isError && !needsLogin && <CheckCircleIcon />}
        <Typography marginLeft={1}>{t("approve_twitter_logged")}</Typography>
      </Box>
      <Box display="flex" flexDirection="row">
        {isCurrentlyLoading && <CircularProgress size={24} />}
        {!isCurrentlyLoading && (needsLogin || isNotFollowed || isError) && (
          <CancelIcon />
        )}
        {!isCurrentlyLoading && !isError && !needsLogin && isFollowed && (
          <CheckCircleIcon />
        )}
        <Typography marginLeft={1}>
          {t("follow_status_following", {
            name: process.env.NEXT_PUBLIC_TWITTER_FOLLOW_NAME,
          })}
        </Typography>
      </Box>
    </>
  );
};
