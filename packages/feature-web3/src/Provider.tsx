import { FC, PropsWithChildren } from "react";
import { WagmiConfig } from "wagmi";
import { Provider as Web3Provider } from "./hooks";
import { wagmiClient, WagmiConfiguredClient } from "./wagmi";

const ProviderWithWagmi: FC<PropsWithChildren<{}>> = ({ children }) => {
  return <Web3Provider>{children}</Web3Provider>;
};
export const Provider: FC<
  PropsWithChildren<{
    client?: WagmiConfiguredClient;
  }>
> = ({ children, client }) => {
  return (
    <WagmiConfig client={client ?? wagmiClient.get()}>
      <ProviderWithWagmi>{children}</ProviderWithWagmi>
    </WagmiConfig>
  );
};
