import { useMemo } from "react";
import { useAppSelector } from "app/store";
import { providers } from "ethers";
import { selectors as web3Selectors, WalletType } from "./redux";
import { useMetamask } from "./metamask/hooks";
import { useWalletConnect } from "./walletConnect/hooks";

export function useWeb3() {
  const { provider: metamaskProvider } = useMetamask();
  const { provider: walletConnectProvider } = useWalletConnect();
  const selectedAddress = useAppSelector(web3Selectors.address);
  const walletType = useAppSelector(web3Selectors.type);

  const provider = useMemo(() => {
    if (walletType === WalletType.METAMASK && metamaskProvider) {
      return new providers.Web3Provider(metamaskProvider);
    } else if (
      walletType === WalletType.WALLET_CONNECT &&
      walletConnectProvider
    ) {
      return new providers.Web3Provider(walletConnectProvider);
    }
    return null;
  }, [walletType, metamaskProvider, walletConnectProvider]);

  return { provider, selectedAddress };
}
