import { FC, PropsWithChildren } from "react";
import { Provider as MetamaskProvider } from "./metamask/hooks";
import { Provider as WalletConnectProvider } from "./walletConnect/hooks";

export const Provider: FC<PropsWithChildren<{}>> = ({ children }) => {
  return (
    <MetamaskProvider>
      <WalletConnectProvider>{children}</WalletConnectProvider>
    </MetamaskProvider>
  );
};
