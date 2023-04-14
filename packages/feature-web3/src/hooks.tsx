import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import { useAccount, useConnect, Chain, useNetwork } from "wagmi";
import { defaultChain } from "@0xflick/utils";

export type TChain = Chain & {
  chainImageUrl: string;
};
export function decorateChainImageUrl(chain?: Chain): string {
  let chainImageUrl = "/chains/unknown.png";
  switch (chain?.id) {
    case 1:
      chainImageUrl = "/chains/homestead.png";
      break;
    case 111_55_111:
      chainImageUrl = "/chains/sepolia.png";
      break;
    case 5:
      chainImageUrl = "/chains/goerli.png";
      break;
  }
  return chainImageUrl;
}

function useDeferFirstRender() {
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  if (typeof window === "undefined") {
    return true;
  }
  // We don't want the address to be available on first load so that client render matches server render
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useLayoutEffect(() => {
    if (isFirstLoad) {
      setIsFirstLoad(false);
    }
  }, [isFirstLoad]);

  return isFirstLoad;
}

export function useWeb3Context() {
  const { connector: activeConnector, isConnected, address } = useAccount({});
  const { connect, isLoading, reset, data: provider } = useConnect();
  // We don't want the address to be available on first load so that client render matches server render
  const isFirstLoad = useDeferFirstRender();
  const { chain } = useNetwork();

  const result = {
    currentChain: isFirstLoad ? undefined : chain ?? defaultChain.get(),
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
