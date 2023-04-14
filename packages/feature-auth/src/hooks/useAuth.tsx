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
import { useWeb3 } from "@0xflick/feature-web3";
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
import { useAccount, useEnsAvatar, useEnsName } from "wagmi";
import { useSelf } from "./useSelf";

function useAuthContext() {
  const [stateToken, setStateToken] = useState<string | null>(null);
  const [roleIds, setRoleIds] = useState<string[]>([]);
  const [state, setState] = useState<
    | "ANONYMOUS"
    | "REQUEST_SIGN_IN"
    | "SIGNING_MESSAGE"
    | "USER_MESSAGE_SIGNED"
    | "AUTHENTICATED"
    | "REQUEST_SIGN_OUT"
  >("ANONYMOUS");
  const isAnonymous = state === "ANONYMOUS";
  const isAuthenticated = state === "AUTHENTICATED";
  const {
    currentChain,
    activeConnector,
    selectedAddress: address,
    isConnected: isWeb3Connected,
  } = useWeb3();
  useEffect(() => {
    if (isWeb3Connected && state === "ANONYMOUS") {
      setState("REQUEST_SIGN_IN");
    }
  }, [isWeb3Connected, state]);

  const { data: ensName, isLoading: ensNameIsLoading } = useEnsName({
    address,
    enabled: !!address,
  });
  const { data: ensAvatar, isLoading: ensAvatarIsLoading } = useEnsAvatar({
    address,
    enabled: !!address,
  });

  const isUserSigningMessage = state === "SIGNING_MESSAGE";
  const isUserRequestingSignIn = state === "REQUEST_SIGN_IN";
  const isUserSigningOut = state === "REQUEST_SIGN_OUT";

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
  const {
    data: user,
    isLoggedIn: userIsLoggedInToGraphql,
    error: selfError,
  } = useSelf();
  useEffect(() => {
    if (userIsLoggedInToGraphql && user) {
      setState("AUTHENTICATED");
      setRoleIds(user.roleIds);
      setStateToken(user.token);
    } else if (selfError) {
      setState("ANONYMOUS");
      setRoleIds([]);
      setStateToken(null);
    }
  }, [user, userIsLoggedInToGraphql, selfError]);
  const signIn = useCallback(() => {
    setState("REQUEST_SIGN_IN");
  }, []);

  const signOut = useCallback(() => {
    tokenReset();
    nonceReset();
    requestSignOut();
    setState("ANONYMOUS");
    setRoleIds([]);
    setStateToken(null);
  }, [tokenReset, nonceReset, requestSignOut]);

  useEffect(() => {
    if (isWeb3Connected && user && user.address !== address) {
      console.log("User is authenticated, but address has changed");
      signOut();
    }
  }, [user, address, signOut, isWeb3Connected]);

  useEffect(() => {
    if (address && isUserRequestingSignIn) {
      fetchNonce({ variables: { address } })
        .then(() => setState("SIGNING_MESSAGE"))
        // TODO: toast
        .catch(() => setState("ANONYMOUS"));
    }
  }, [address, fetchNonce, isUserRequestingSignIn]);

  useEffect(() => {
    if (tokenIsError) {
      setState("ANONYMOUS");
      setRoleIds([]);
      setStateToken(null);
    }
  }, [tokenIsError]);
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
            setState("USER_MESSAGE_SIGNED");
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
                // TODO: toast
                console.error(err);
                setState("ANONYMOUS");
                setRoleIds([]);
                setStateToken(null);
              });
          },
          (err: Error) => {
            console.error(err);
            // FIXME: figure out rejection vs error vs wallet type
            //TODO: toast;
          }
        );
      });
    }
  }, [
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
        // TODO: toast
        console.warn("No token returned from server");
        setState("ANONYMOUS");
        setRoleIds([]);
        setStateToken(null);
        return;
      }
      try {
        const authUser = decodeJwtToken(token);
        if (authUser && authUser.address === address) {
          console.log(
            "Found a token and the token addresses matches the user, signing in"
          );
          setRoleIds(authUser.roleIds);
          setStateToken(token);
          setState("AUTHENTICATED");
        } else {
          console.warn(`Unable to parse token for ${address}`);
          // TODO: toast
          setState("ANONYMOUS");
          setRoleIds([]);
          setStateToken(null);
        }
      } catch (err) {
        console.error(err);
        // TODO: toast
        setState("ANONYMOUS");
        setRoleIds([]);
        setStateToken(null);
      }
    }
  }, [address, nonceData, nonceIsSuccess, tokenData, tokenIsSuccess]);
  const setToken = useCallback(
    (token: string) => {
      // decode token
      const authUser = decodeJwtToken(token);
      if (authUser && authUser.address === address) {
        setRoleIds(authUser.roleIds);
        setStateToken(token);
        setState("AUTHENTICATED");
      } else {
        console.warn(`Unable to parse token for ${address}`);
        // TODO: toast
        setState("ANONYMOUS");
        setRoleIds([]);
        setStateToken(null);
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
    token: stateToken || tokenData?.signIn?.token || user?.token || undefined,
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
  const ctx = useContext(AuthProvider);
  if (ctx === null) {
    throw new Error("No context defined");
  }
  return ctx;
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
