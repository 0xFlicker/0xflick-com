import { FC, PropsWithChildren } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import { Provider as Web3Provider } from "@0xflick/feature-web3/src/Provider";
import { Provider as AuthProvider } from "@0xflick/feature-auth/src/hooks/useAuth";
import { Provider } from "react-redux";
import { Provider as ApolloProvider } from "graphql/Provider";
import { Provider as LocaleProvider } from "@0xflick/feature-locale";
import { Provider as AffiliateProvider } from "features/affiliates/hooks/useManageAffiliates";
import { Provider as ThemeProvider, TTheme } from "@0xflick/feature-theme";
import { store, useAppSelector } from "@0xflick/app-store";
import { InitOptions } from "i18next";

export const StateWithWebContent: FC<PropsWithChildren<{}>> = ({
  children,
}) => {
  return (
    <AuthProvider>
      <AffiliateProvider>{children}</AffiliateProvider>
    </AuthProvider>
  );
};
export const StateAvailableContent: FC<
  PropsWithChildren<{
    initialTheme: TTheme;
  }>
> = ({ children, initialTheme = "dark" }) => {
  return (
    <ApolloProvider>
      <ThemeProvider initialTheme={initialTheme}>
        <Web3Provider>
          <StateWithWebContent>{children}</StateWithWebContent>
        </Web3Provider>
      </ThemeProvider>
    </ApolloProvider>
  );
};

export const DefaultProvider: FC<
  PropsWithChildren<{ i18n: InitOptions; initialTheme: TTheme }>
> = ({ children, i18n, initialTheme = "light" }) => (
  <LocaleProvider i18n={i18n}>
    <Provider store={store}>
      <StateAvailableContent initialTheme={initialTheme}>
        <CssBaseline />
        {children}
      </StateAvailableContent>
    </Provider>
  </LocaleProvider>
);
