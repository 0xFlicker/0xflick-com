import {
  FC,
  createContext,
  PropsWithChildren,
  useCallback,
  useEffect,
  useContext,
  useState,
  useMemo,
} from "react";
import { selectors as authSelectors, actions as authActions } from "../redux";
import { selectors as web3Selectors, useWeb3 } from "features/web3";
import { useAppDispatch, useAppSelector } from "app/store";
import { useLazySignInQuery, useLazySignOutQuery } from "../api";
import useLocalStorage from "use-local-storage";
import { useNonce } from "./useNonce";
import {
  createJweRequest,
  decodeJwtToken,
  authMessage,
  TAllowedAction,
  Matcher,
} from "@0xflick/models";
// import { useListRolePermissionsQuery } from "features/admin/api";

export function useSavedToken(token?: string) {
  const [savedToken, setSavedToken] = useLocalStorage("token", "", {
    syncData: true,
  });
  const user = useMemo(
    () => (savedToken && decodeJwtToken(savedToken)) || null,
    [savedToken]
  );

  useEffect(() => {
    if (token) {
      setSavedToken(token);
    }
  }, [token, setSavedToken]);

  return {
    user,
    savedToken,
    setSavedToken,
    clearToken: useCallback(() => {
      setSavedToken("");
    }, [setSavedToken]),
  };
}

function useAuthContext() {
  const isAuthenticated = useAppSelector(authSelectors.isAuthenticated);
  const isAnonymous = useAppSelector(authSelectors.isAnonymous);
  const isWeb3Connected = useAppSelector(web3Selectors.isConnected);
  const address = useAppSelector(web3Selectors.address);

  const isUserSigningMessage = useAppSelector(
    authSelectors.isUserSigningMessage
  );
  const isUserRequestingSignIn = useAppSelector(
    authSelectors.isUserRequestingSignIn
  );
  const isUserSigningOut = useAppSelector(authSelectors.isUserSigningOut);
  const { provider } = useWeb3();
  const [requestSignOut] = useLazySignOutQuery();

  const [fetchNonce, { data: nonceData, loading: nonceIsLoading }] = useNonce();
  const nonceIsSuccess = !!nonceData;

  const [
    fetchToken,
    {
      data: tokenData,
      error: tokenError,
      isLoading: tokenIsLoading,
      isSuccess: tokenIsSuccess,
      isError: tokenIsError,
      isFetching: tokenIsFetching,
      isUninitialized: tokenIsUninitialized,
    },
  ] = useLazySignInQuery();
  const { user, savedToken, clearToken, setSavedToken } = useSavedToken(
    tokenData?.token
  );
  const dispatch = useAppDispatch();

  const signIn = useCallback(() => {
    dispatch(authActions.userRequestsSignIn());
  }, [dispatch]);

  const signOut = useCallback(() => {
    clearToken();
    requestSignOut();
    dispatch(authActions.userSignOut());
  }, [dispatch, requestSignOut, clearToken]);

  useEffect(() => {
    if (isWeb3Connected && user && user.address !== address) {
      signOut();
    }
  }, [user, address, signOut, isWeb3Connected]);
  useEffect(() => {
    if (!isAuthenticated && user && user.address === address) {
      dispatch(
        authActions.userSignInSuccess({
          roles: user.roleIds,
          token: savedToken,
        })
      );
    }
  }, [isAuthenticated, savedToken, dispatch, user, address]);

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
      provider &&
      address
    ) {
      const message = authMessage(nonceData.nonceForAddress.nonce.toString());
      const signer = provider.getSigner();
      signer.signMessage(message).then(
        (signature) => {
          dispatch(authActions.userMessageSigned(signature));
          createJweRequest(signature, nonceData.nonceForAddress.nonce)
            .then((jwe) => {
              return fetchToken({
                address,
                jwe,
              }).unwrap();
            })
            .catch(() => {
              dispatch(authActions.userSignOut());
            });
        },
        (err) => {
          console.error(err);
          // FIXME: figure out rejection vs error vs wallet type
          dispatch(authActions.userSignatureError());
        }
      );
      // .finally(() => dispatch(authActions.userSigningMessage(false)));
    }
  }, [
    dispatch,
    isUserSigningMessage,
    nonceData,
    nonceIsSuccess,
    provider,
    address,
    fetchToken,
    savedToken,
  ]);

  useEffect(() => {
    if (nonceIsSuccess && nonceData && tokenIsSuccess && tokenData && address) {
      const { token } = tokenData;
      try {
        const authUser = decodeJwtToken(token);
        if (authUser.address === address) {
          dispatch(
            authActions.userSignInSuccess({
              token,
              roles: authUser.roleIds,
            })
          );
        }
      } catch (err) {
        console.error(err);
        dispatch(authActions.userSignInError());
      }
    }
  }, [address, dispatch, nonceData, nonceIsSuccess, tokenData, tokenIsSuccess]);

  // const { data: rolePermissionsData } = useListRolePermissionsQuery(
  //   {
  //     token: savedToken,
  //     roleIds: user?.roleIds ?? [],
  //   },
  //   {
  //     skip: !savedToken || !user?.roleIds || user.roleIds.length === 0,
  //   }
  // );

  return {
    isAuthenticated,
    isAnonymous,
    isUserRequestingSignIn,
    isUserSigningMessage,
    isUserWaiting: nonceIsLoading || tokenIsLoading || tokenIsFetching,
    isUserSigningOut,
    token: tokenData?.token,
    user,
    // permissions: rolePermissionsData,
    signIn,
    signOut,
    savedToken,
    setSavedToken,
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

export function useAuth() {
  const ctx = useContext(AuthProvider);
  if (ctx === null) {
    throw new Error("No context defined");
  }
  return ctx;
}

// TODO: re-enable once graphql login works
const permissions = [] as TAllowedAction[];
export function useHasPermission(permissionMatcher: Matcher<TAllowedAction[]>) {
  // const auth = useAuth();
  // const permissions = [] as TAllowedAction[];
  return useMemo(() => {
    if (permissions) {
      return permissionMatcher(permissions);
    }
    return false;
  }, [permissionMatcher]);
}
