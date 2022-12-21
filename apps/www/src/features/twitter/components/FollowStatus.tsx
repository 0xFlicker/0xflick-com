import { Box, Typography, CircularProgress } from "@mui/material";
import { useLocale } from "@0xflick/feature-locale";
import { FC } from "react";
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { useAuth } from "@0xflick/feature-auth/src/hooks";
import { useIsFollowerQuery } from "../graphql/isFollowerQuery.generated";

export const FollowStatus: FC = () => {
  const { t } = useLocale("common");
  const { isAuthenticated } = useAuth();
  const { data, error: isError, loading: isLoading } = useIsFollowerQuery();
  const isFollowed = isAuthenticated && !!data && data.self?.isTwitterFollower;
  const needsLogin = !!isAuthenticated;
  const isNotFollowed =
    !isAuthenticated || (!!data && !data.self?.isTwitterFollower);
  const isCurrentlyLoading = isLoading;
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
