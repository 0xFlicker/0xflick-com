import { FC, PropsWithChildren } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import { Provider as Web3Provider } from "@0xflick/feature-web3/src/Provider";
import { Provider as AuthProvider } from "@0xflick/feature-auth/src/hooks/useAuth";
import { Provider as ApolloProvider } from "graphql/Provider";
import { Provider as LocaleProvider } from "@0xflick/feature-locale";
import { Provider as AffiliateProvider } from "features/affiliates/hooks/useManageAffiliates";
import { Provider as ThemeProvider, TTheme } from "@0xflick/feature-theme";
import { i18n as I18nType } from "i18next";

export const DefaultProvider: FC<
  PropsWithChildren<{ i18n?: I18nType; initialTheme: TTheme }>
> = ({ children, i18n, initialTheme = "light" }) => (
  <LocaleProvider i18n={i18n}>
    <CssBaseline />
    <ApolloProvider>
      <ThemeProvider initialTheme={initialTheme}>
        <Web3Provider>
          <AuthProvider>
            <AffiliateProvider>{children}</AffiliateProvider>
          </AuthProvider>
        </Web3Provider>
      </ThemeProvider>
    </ApolloProvider>
  </LocaleProvider>
);
