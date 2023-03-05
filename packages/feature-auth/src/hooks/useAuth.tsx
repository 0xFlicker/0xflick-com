import {
  FC,
  createContext,
  PropsWithChildren,
  useCallback,
  useEffect,
  useContext,
  useMemo,
  useState,
} from "react";
import { selectors as authSelectors, actions as authActions } from "../redux";
import { useWeb3 } from "@0xflick/feature-web3";
import {
  actions as web3Actions,
  selectors as web3Selectors,
} from "@0xflick/feature-web3/src/redux";
import { useAppDispatch, useAppSelector } from "@0xflick/app-store";
import useLocalStorage from "use-local-storage";
import { useNonce } from "./useNonce";
import {
  createJweRequest,
  decodeJwtToken,
  authMessage,
  TAllowedAction,
  Matcher,
} from "@0xflick/models";
import { useSignIn } from "./useSignIn";
import { useSignOut } from "./useSignOut";
import { useAllowedActions } from "./useAllowedActions";
import { useEnsAvatar, useEnsName } from "wagmi";
import { useSelf } from "./useSelf";

function useAuthContext() {
  const isAuthenticated = useAppSelector(authSelectors.isAuthenticated);
  const isAnonymous = useAppSelector(authSelectors.isAnonymous);
  const {
    currentChain,
    activeConnector,
    selectedAddress: address,
    isConnected: isWeb3Connected,
  } = useWeb3();

  const { data: ensName, isLoading: ensNameIsLoading } = useEnsName({
    address,
    enabled: !!address,
  });
  const { data: ensAvatar, isLoading: ensAvatarIsLoading } = useEnsAvatar({
    address,
    enabled: !!address,
  });

  const isUserSigningMessage = useAppSelector(
    authSelectors.isUserSigningMessage
  );
  const isUserRequestingSignIn = useAppSelector(
    authSelectors.isUserRequestingSignIn
  );
  const isUserSigningOut = useAppSelector(authSelectors.isUserSigningOut);

  // const { data: signer } = useSigner({});
  const [requestSignOut] = useSignOut();

  const chainId = currentChain?.id;
  const [
    fetchNonce,
    { data: nonceData, loading: nonceIsLoading, reset: nonceReset },
  ] = useNonce();
  const nonceIsSuccess = !!nonceData;

  const [
    fetchToken,
    {
      data: tokenData,
      error: tokenError,
      loading: tokenIsLoading,
      reset: tokenReset,
    },
  ] = useSignIn();
  const tokenIsSuccess = !!tokenData;
  const tokenIsError = !!tokenError;
  const { data: user, isLoggedIn: userIsLoggedInToGraphql } = useSelf();
  const dispatch = useAppDispatch();
  const signIn = useCallback(() => {
    if (!isWeb3Connected) {
      dispatch(web3Actions.openWalletSelectModal());
    } else {
      dispatch(authActions.userRequestsSignIn());
    }
  }, [dispatch, isWeb3Connected]);

  const signOut = useCallback(() => {
    tokenReset();
    nonceReset();
    requestSignOut();
    dispatch(authActions.userSignOut());
  }, [tokenReset, nonceReset, requestSignOut, dispatch]);

  useEffect(() => {
    if (isWeb3Connected && user && user.address !== address) {
      console.log("User is authenticated, but address has changed");
      signOut();
    }
  }, [user, address, signOut, isWeb3Connected]);
  useEffect(() => {
    if (!isAuthenticated && user && user.address === address) {
      console.log(
        "User is not authenticated, but we have a user and a matching address so signing in"
      );
      dispatch(
        authActions.userSignInSuccess({
          roles: user.roleIds,
          token: user.token,
        })
      );
    }
  }, [isAuthenticated, dispatch, user, address]);

  useEffect(() => {
    if (address && isUserRequestingSignIn) {
      fetchNonce({ variables: { address } })
        .then(() => dispatch(authActions.userNeedsSignature()))
        .catch(() => dispatch(authActions.userSignOut()));
    }
  }, [address, dispatch, fetchNonce, isUserRequestingSignIn]);

  useEffect(() => {
    if (tokenIsError) {
      dispatch(authActions.userSignOut());
    }
  }, [dispatch, tokenIsError]);
  useEffect(() => {
    if (
      isUserSigningMessage &&
      nonceIsSuccess &&
      nonceData &&
      activeConnector &&
      address &&
      chainId
    ) {
      const now = Date.now();
      const message = authMessage({
        address,
        nonce: nonceData.nonceForAddress?.nonce.toString() || "0",
        chainId,
        domain: process.env.NEXT_PUBLIC_APP_NAME ?? "",
        expirationTime:
          now + Number(process.env.SIWE_EXPIRATION_TIME_SECONDS) * 1000,
        issuedAt: now,
        uri: process.env.NEXT_PUBLIC_JWT_CLAIM_ISSUER ?? "",
        version: "1",
      });
      activeConnector.getSigner({ chainId }).then((signer) => {
        signer.signMessage(message).then(
          (signature: string) => {
            dispatch(authActions.userMessageSigned(signature));
            createJweRequest(signature, nonceData.nonceForAddress?.nonce || 0)
              .then((jwe) => {
                return fetchToken({
                  variables: {
                    address,
                    jwe,
                    chainId,
                    issuedAt: now.toString(),
                  },
                });
              })
              .catch((err) => {
                console.error(err);
                dispatch(authActions.userSignOut());
              });
          },
          (err: Error) => {
            console.error(err);
            // FIXME: figure out rejection vs error vs wallet type
            dispatch(authActions.userSignatureError());
          }
        );
      });
    }
  }, [
    dispatch,
    isUserSigningMessage,
    nonceData,
    nonceIsSuccess,
    activeConnector,
    address,
    fetchToken,
    chainId,
  ]);

  useEffect(() => {
    if (nonceIsSuccess && nonceData && tokenIsSuccess && tokenData && address) {
      const token = tokenData.signIn?.token;
      if (!token) {
        console.warn("No token returned from server");
        dispatch(authActions.userSignInError());
        return;
      }
      try {
        const authUser = decodeJwtToken(token);
        if (authUser && authUser.address === address) {
          console.log(
            "Found a token and the token addresses matches the user, signing in"
          );
          dispatch(
            authActions.userSignInSuccess({
              token,
              roles: authUser.roleIds,
            })
          );
        } else {
          console.warn(`Unable to parse token for ${address}`);
          dispatch(authActions.userSignInError());
        }
      } catch (err) {
        console.error(err);
        dispatch(authActions.userSignInError());
      }
    }
  }, [address, dispatch, nonceData, nonceIsSuccess, tokenData, tokenIsSuccess]);
  const setToken = useCallback(
    (token: string) => {
      // decode token
      const authUser = decodeJwtToken(token);
      if (authUser && authUser.address === address) {
        dispatch(
          authActions.userSignInSuccess({
            token,
            roles: authUser.roleIds,
          })
        );
      } else {
        console.warn(`Unable to parse token for ${address}`);
        dispatch(authActions.userSignInError());
      }
    },
    [address]
  );
  return {
    isAuthenticated,
    isAnonymous,
    isUserRequestingSignIn,
    isUserSigningMessage,
    isUserWaiting: nonceIsLoading || tokenIsLoading,
    isUserSigningOut,
    token: tokenData?.signIn?.token || user?.token || undefined,
    user,
    allowedActions: user?.allowedActions ?? [],
    signIn,
    signOut,
    ensName,
    ensNameIsLoading,
    ensAvatar,
    ensAvatarIsLoading,
    setToken,
  };
}

type TContext = ReturnType<typeof useAuthContext>;
const AuthProvider = createContext<TContext | null>(null);

export const Provider: FC<PropsWithChildren<{}>> = ({ children }) => {
  const context = useAuthContext();

  return (
    <AuthProvider.Provider value={context}>{children}</AuthProvider.Provider>
  );
};

export function useAuth({
  noAutoSignIn,
}: {
  noAutoSignIn?: boolean;
} = {}) {
  const [autoLoginUntil, setAutoLoginUntil] = useState(0);
  const isAnonymous = useAppSelector(authSelectors.isAnonymous);
  const isWeb3Connected = useAppSelector(web3Selectors.isConnected);

  const ctx = useContext(AuthProvider);
  if (ctx === null) {
    throw new Error("No context defined");
  }

  const { signIn: originalSignIn, isAuthenticated } = ctx;
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (noAutoSignIn || autoLoginUntil < Date.now()) {
      return;
    }
    if (isWeb3Connected && isAnonymous) {
      dispatch(authActions.userRequestsSignIn());
    }
  }, [isWeb3Connected, isAnonymous, dispatch, noAutoSignIn, autoLoginUntil]);

  useEffect(() => {
    if (isAuthenticated) {
      setAutoLoginUntil(0);
    }
  }, [isAuthenticated]);
  const signIn = useCallback(() => {
    setAutoLoginUntil(Date.now() + 1000 * 60);
    originalSignIn();
  }, [originalSignIn]);
  return {
    ...ctx,
    signIn,
  };
}

export function useHasAllowedAction(
  permissionMatcher: Matcher<TAllowedAction[]>
) {
  const { allowedActions } = useAuth();
  return useMemo(() => {
    if (allowedActions) {
      return permissionMatcher(allowedActions);
    }
    return false;
  }, [permissionMatcher, allowedActions]);
}
