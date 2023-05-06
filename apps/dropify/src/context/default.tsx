import { FC, PropsWithChildren } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { Provider as Web3Provider } from "@0xflick/feature-web3/src/Provider";
import { Provider as AuthProvider } from "@0xflick/feature-auth/src/hooks/useAuth";
import { Provider as ApolloProvider } from "@/graphql/Provider";
import { Provider as LocaleProvider } from "@0xflick/feature-locale";
import { i18n as I18nType } from "i18next";
import dropifyTheme from "@/theme";
import { WagmiConfiguredClient } from "@0xflick/feature-web3/src/wagmi";

export const DefaultProvider: FC<
  PropsWithChildren<{ i18n?: I18nType; wagmiClient?: WagmiConfiguredClient }>
> = ({ children, wagmiClient, i18n }) => (
  <LocaleProvider i18n={i18n}>
    <ApolloProvider>
      <ThemeProvider theme={dropifyTheme}>
        <CssBaseline />
        <Web3Provider client={wagmiClient}>
          <AuthProvider>{children}</AuthProvider>
        </Web3Provider>
      </ThemeProvider>
    </ApolloProvider>
  </LocaleProvider>
);
