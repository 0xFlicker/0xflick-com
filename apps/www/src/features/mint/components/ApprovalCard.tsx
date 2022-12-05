import { FC, useEffect, useState, useCallback, useMemo } from "react";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardHeader,
  CardContent,
  Typography,
  LinearProgress,
} from "@mui/material";
import { useLocale } from "@0xflick/feature-locale";
import { useAppDispatch } from "@0xflick/app-store";
import { Connect, useWeb3 } from "@0xflick/feature-web3";

import { useAuth } from "features/auth/hooks";
import { useLazyIsFollowingQuery } from "features/twitter/api";
import { LoginWithTwitterButton } from "features/twitter/components/LoginWithTwitterButton";
import { Follow } from "features/faucet/components/Follow";
import { FollowStatus } from "features/twitter/components/FollowStatus";
import { LoginStatus } from "./LoginStatus";
import { ConnectedStatus } from "./ConnectedStatus";
import { decodeJwtToken } from "@0xflick/models";
import { actions as authActions } from "features/auth/redux";
import { useRequestPresaleApprovalMutation } from "../hooks";

export enum ApprovalCloseReason {
  SUCCESS = "success",
  ERROR = "error",
  CANCELLED = "cancelled",
}

interface IProps {
  affiliate?: string;
}

enum EApprovalModalStep {
  INITIAL = "initial",
  NEEDS_CONNECT = "needs_connect",
  NEEDS_SIGN_IN = "needs_sign_in",
  NEEDS_TWITTER_SIGN_IN = "needs_twitter_sign_in",
  NEEDS_FOLLOW = "needs_follow",
  SUCCESS = "success",
}

export const ApprovalCard: FC<IProps> = ({ affiliate }) => {
  const { t } = useLocale(["common"]);
  const { signIn, isAuthenticated, isAnonymous, setSavedToken } = useAuth();
  const { provider, selectedAddress } = useWeb3();
  const dispatch = useAppDispatch();
  const [step, setStep] = useState(EApprovalModalStep.INITIAL);
  const [fetchPresaleApproval, presaleApprovalQuery] =
    useRequestPresaleApprovalMutation();

  const [
    fetchIsFollowing,
    { isError, isFetching, isLoading, isSuccess, data },
  ] = useLazyIsFollowingQuery();
  useEffect(() => {
    if (isAuthenticated) {
      fetchIsFollowing();
    }
  }, [fetchIsFollowing, isAuthenticated]);
  const needsTwitterAuth =
    isLoading || (isSuccess && data && "needsLogin" in data && data.needsLogin);
  const isFollowed =
    isAuthenticated &&
    isSuccess &&
    data &&
    !needsTwitterAuth &&
    "following" in data &&
    data.following;
  const isCurrentlyLoading = isLoading || isFetching;
  const isConnected = provider && selectedAddress;

  // When approval is granted, updated new token
  useEffect(() => {
    if (
      presaleApprovalQuery.data &&
      presaleApprovalQuery.data.requestPresaleApproval.approved
    ) {
      const token = presaleApprovalQuery.data.requestPresaleApproval.token;
      const authUser = decodeJwtToken(token);
      if (authUser.address === selectedAddress) {
        setSavedToken(token);
        dispatch(
          authActions.userSignInSuccess({
            token,
            roles: authUser.roleIds,
          })
        );
      }
    }
  }, [presaleApprovalQuery.data, selectedAddress, dispatch, setSavedToken]);

  // Go back to go, do not collect $200
  useEffect(() => {
    if (step !== EApprovalModalStep.NEEDS_CONNECT && !isConnected) {
      setStep(EApprovalModalStep.NEEDS_CONNECT);
    }
  }, [isConnected, step]);

  useEffect(() => {
    if (step === EApprovalModalStep.INITIAL && !isConnected) {
      setStep(EApprovalModalStep.NEEDS_CONNECT);
    }
    if (
      step === EApprovalModalStep.NEEDS_CONNECT &&
      isConnected &&
      !isAuthenticated
    ) {
      setStep(EApprovalModalStep.NEEDS_SIGN_IN);
    }
    if (
      [EApprovalModalStep.NEEDS_SIGN_IN, EApprovalModalStep.INITIAL].includes(
        step
      ) &&
      isAuthenticated
    ) {
      setStep(EApprovalModalStep.NEEDS_TWITTER_SIGN_IN);
    }
    if (
      step === EApprovalModalStep.NEEDS_TWITTER_SIGN_IN &&
      !needsTwitterAuth &&
      !isError
    ) {
      setStep(EApprovalModalStep.NEEDS_FOLLOW);
    }
    if (isFollowed) {
      setStep(EApprovalModalStep.SUCCESS);
    }
  }, [
    setStep,
    step,
    isAuthenticated,
    isFollowed,
    needsTwitterAuth,
    isConnected,
    isError,
  ]);

  const onRequestApproval = useCallback(
    () =>
      fetchPresaleApproval({
        variables: {
          affiliate,
        },
      }),
    [fetchPresaleApproval, affiliate]
  );

  let description = "";
  if (step === EApprovalModalStep.NEEDS_TWITTER_SIGN_IN) {
    description = t("approve_twitter_auth_description", {
      name: process.env.NEXT_PUBLIC_TWITTER_FOLLOW_NAME,
    });
  } else if (step === EApprovalModalStep.NEEDS_FOLLOW) {
    description = t("approve_twitter_follow_description", {
      name: process.env.NEXT_PUBLIC_TWITTER_FOLLOW_NAME,
    });
  } else if (step === EApprovalModalStep.NEEDS_SIGN_IN) {
    description = t("approve_web3_login_description");
  } else if (step === EApprovalModalStep.NEEDS_CONNECT) {
    description = t("approve_web3_connect_description");
  } else if (step === EApprovalModalStep.SUCCESS) {
    description = t("approve_success_description");
  }
  return (
    <Card>
      <CardHeader
        id="approve-presale-title"
        title={t("approve_presale_title")}
      />
      <CardContent>
        <Box
          id="approve-presale-description"
          minHeight={200}
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignContent="center"
        >
          <ConnectedStatus />
          <LoginStatus />
          <FollowStatus />
          <Typography
            sx={{
              mt: 4,
            }}
          >
            {description}
          </Typography>
        </Box>

        <Box minHeight={10}>
          {isFetching && <LinearProgress variant="indeterminate" />}
        </Box>
        <CardActions>
          {step === EApprovalModalStep.NEEDS_CONNECT && <Connect />}
          {step === EApprovalModalStep.NEEDS_SIGN_IN && (
            <Button variant="contained" color="primary" onClick={signIn}>
              {t("auth_button_login", {
                ns: "common",
              })}
            </Button>
          )}
          {!isCurrentlyLoading &&
            step === EApprovalModalStep.NEEDS_TWITTER_SIGN_IN && (
              <LoginWithTwitterButton />
            )}
          {step === EApprovalModalStep.NEEDS_FOLLOW && <Follow />}
          {step === EApprovalModalStep.SUCCESS && (
            <Button
              variant="contained"
              color="primary"
              onClick={onRequestApproval}
            >
              {t("button_approve_presale", {
                ns: "common",
              })}
            </Button>
          )}
        </CardActions>
      </CardContent>
    </Card>
  );
};
