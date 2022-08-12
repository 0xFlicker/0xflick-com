import { useAppDispatch, useAppSelector } from "app/store";
import { providers, BigNumber, utils } from "ethers";
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
  selectors as web3Selectors,
  WalletType,
  WalletStatus,
} from "../redux";
import { selectors as configSelectors } from "features/config";

interface IContext {
  provider?: providers.ExternalProvider;
}
export function useMetamaskProvider(): IContext {
  const [detectedChainId, setDetectedChainId] = useState<number>();
  const dispatch = useAppDispatch();
  const walletType = useAppSelector(web3Selectors.type);
  const status = useAppSelector(web3Selectors.status);
  const myChainId = useAppSelector(configSelectors.chainId);

  const initNetwork = useCallback(
    (networkId: any) => {
      const chainIdNum = BigNumber.from(networkId).toNumber();
      setDetectedChainId(chainIdNum);
      if (chainIdNum !== myChainId) {
        dispatch(web3Actions.wrongNetwork());
      } else if (window.ethereum?.isConnected()) {
        dispatch(web3Actions.connected());
      } else {
        dispatch(web3Actions.idle());
      }
    },
    [dispatch, myChainId]
  );
  const chainId = useAppSelector(configSelectors.chainId);
  useEffect(() => {
    if (
      window.ethereum &&
      walletType === WalletType.METAMASK &&
      status === WalletStatus.SWITCH_CHAIN &&
      detectedChainId !== chainId
    ) {
      window.ethereum
        .request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: utils.hexValue(chainId) }],
        })
        .then((response) => {
          if (!response) {
            dispatch(web3Actions.connectMetamask());
          }
        });
    }
  }, [detectedChainId, chainId, walletType, status, dispatch]);

  useEffect(() => {
    if (window.ethereum?.isConnected()) {
      window.ethereum
        .request<string[]>({
          method: "eth_accounts",
        })
        .then((accounts) => {
          if (accounts && accounts.length > 0) {
            dispatch(web3Actions.connectMetamask());
            dispatch(web3Actions.connected());
            dispatch(
              web3Actions.setAccounts(accounts.filter((a) => !!a) as string[])
            );
          } else {
            dispatch(web3Actions.idle());
          }
        });
    }
  }, [dispatch]);
  useEffect(() => {
    if (!window.ethereum || !window.ethereum.chainId) {
      return;
    }
    if (walletType === WalletType.METAMASK && status === WalletStatus.INIT) {
      window.ethereum
        .request({ method: "eth_chainId" })
        .then(async (chainId) => {
          if (BigNumber.from(chainId).toNumber() !== myChainId) {
            dispatch(web3Actions.wrongNetwork());
          } else {
            const accounts = await window.ethereum.request<string[]>({
              method: "eth_requestAccounts",
            });
            if (accounts) {
              dispatch(web3Actions.connected());
              dispatch(
                web3Actions.setAccounts(accounts.filter((a) => !!a) as string[])
              );
            } else {
              dispatch(web3Actions.idle());
            }
          }
        })
        .catch((err) => {
          dispatch(web3Actions.error(fromError(err)));
        });
    }
  }, [status, initNetwork, dispatch, walletType, myChainId]);

  useEffect(() => {
    if (!window.ethereum || walletType !== WalletType.METAMASK) {
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

    window.ethereum.on("chainChanged", networkChangedHandler);
    window.ethereum.on("connect", onConnect);
    window.ethereum.on("disconnect", onDisconnect);
    window.ethereum.on("accountsChanged", onAccountsChanged);

    return () => {
      window.ethereum.removeListener("chainChanged", networkChangedHandler);
      window.ethereum.removeListener("connect", onConnect);
      window.ethereum.removeListener("disconnect", onDisconnect);
      window.ethereum.removeListener("accountsChanged", onAccountsChanged);
    };
  }, [dispatch, initNetwork, walletType]);

  return {
    provider: typeof window !== "undefined" && (window?.ethereum as any),
  };
}

const MetamaskContext = createContext<IContext>({});

export const Provider: FC<PropsWithChildren<{}>> = ({ children }) => {
  const context = useMetamaskProvider();

  return (
    <MetamaskContext.Provider value={context}>
      {children}
    </MetamaskContext.Provider>
  );
};

export function useMetamask() {
  return useContext(MetamaskContext);
}
