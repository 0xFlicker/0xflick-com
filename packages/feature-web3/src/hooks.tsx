import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAppDispatch } from "@0xflick/app-store";
import { useAccount, useConnect, Chain, useNetwork } from "wagmi";
import { defaultChain } from "@0xflick/utils";

export type TChain = Chain & {
  chainImageUrl: string;
};
export function decorateChainImageUrl(chain: Chain): TChain {
  let chainImageUrl = "/chains/unknown.png";
  switch (chain?.id) {
    case 1:
      chainImageUrl = "/chains/homestead.png";
      break;
    case 111_55_111:
      chainImageUrl = "/chains/sepolia.png";
      break;
  }
  return {
    ...chain,
    chainImageUrl,
  };
}

export function useWeb3Context() {
  const dispatch = useAppDispatch();
  const chainImageUrl = useMemo<TChain>(() => {
    return decorateChainImageUrl(defaultChain.get());
  }, []);
  const { connector: activeConnector, isConnected, address } = useAccount({});
  const {
    connect,
    isLoading,
    reset,
    data: provider,
  } = useConnect({
    onSettled: () => {},
  });
  // We don't want the address to be available on first load so that client render matches server render
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  useEffect(() => {
    if (isFirstLoad) {
      setIsFirstLoad(false);
    }
  }, [isFirstLoad]);

  const result = {
    currentChain: chainImageUrl,
    provider: provider?.provider,
    selectedAddress: isFirstLoad ? undefined : address,
    connect,
    reset,
    activeConnector,
    isConnected,
    isLoading,
  };
  return result;
}

type TContext = ReturnType<typeof useWeb3Context>;
const Web3Provider = createContext<TContext | null>(null);

export const Provider: FC<PropsWithChildren<{}>> = ({ children }) => {
  const context = useWeb3Context();
  return (
    <Web3Provider.Provider value={context}>{children}</Web3Provider.Provider>
  );
};

export function useWeb3() {
  const context = useContext(Web3Provider);
  if (!context) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
}
