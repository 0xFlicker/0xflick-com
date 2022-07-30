import { useAppDispatch, useAppSelector } from "app/store";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { providers } from "ethers";
import {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { fromError } from "../error";
import {
  actions as web3Actions,
  WalletStatus,
  selectors as web3Selectors,
  WalletType,
} from "../redux";

const webConnectRpc = process.env.WEB3_RPC_URL || "";

interface IContext {
  provider?: providers.ExternalProvider;
}
export function useWebConnectProvider(): IContext {
  const dispatch = useAppDispatch();
  const status = useAppSelector(web3Selectors.status);
  const walletType = useAppSelector(web3Selectors.type);

  const [walletConnectProvider, setWalletConnectProvider] =
    useState<WalletConnectProvider>();

  const initNetwork = useCallback(
    (networkId: any) => {
      if (networkId.toString() !== process.env.NEXT_PUBLIC_CHAIN_ID) {
        dispatch(web3Actions.wrongNetwork());
      } else if (window.ethereum.isConnected()) {
        dispatch(web3Actions.connected());
      } else {
        dispatch(web3Actions.idle());
      }
    },
    [dispatch]
  );

  useEffect(() => {
    if (
      walletType === WalletType.WALLET_CONNECT &&
      status === WalletStatus.INIT
    ) {
      const walletProvider = new WalletConnectProvider({
        rpc: {
          [process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID]: webConnectRpc,
        },
      });
      setWalletConnectProvider(walletProvider);
      walletProvider
        .enable()
        .then((accounts) => {
          dispatch(web3Actions.setAccounts(accounts));
        })
        .catch((err) => {
          dispatch(web3Actions.error(fromError(err)));
        });
    }
  }, [status, initNetwork, dispatch, walletType]);

  useEffect(() => {
    if (!walletConnectProvider) {
      return;
    }
    const networkChangedHandler = (networkId: any) => {
      initNetwork(networkId);
    };
    const onConnect = () => {
      dispatch(web3Actions.connected());
    };
    const onDisconnect = () => {
      dispatch(web3Actions.disconnected());
    };
    const onAccountsChanged = (accounts: any) => {
      dispatch(web3Actions.setAccounts(accounts));
    };

    walletConnectProvider.on("chainChanged", networkChangedHandler);
    walletConnectProvider.on("connect", onConnect);
    walletConnectProvider.on("disconnect", onDisconnect);
    walletConnectProvider.on("accountsChanged", onAccountsChanged);

    return () => {
      walletConnectProvider.removeListener(
        "chainChanged",
        networkChangedHandler
      );
      walletConnectProvider.removeListener("connect", onConnect);
      walletConnectProvider.removeListener("disconnect", onDisconnect);
      walletConnectProvider.removeListener(
        "accountsChanged",
        onAccountsChanged
      );
    };
  });

  return { provider: walletConnectProvider };
}

const WalletConnectContext = createContext<IContext>({});

export const Provider: FC<PropsWithChildren<{}>> = ({ children }) => {
  const context = useWebConnectProvider();

  return (
    <WalletConnectContext.Provider value={context}>
      {children}
    </WalletConnectContext.Provider>
  );
};

export function useWalletConnect() {
  return useContext(WalletConnectContext);
}
