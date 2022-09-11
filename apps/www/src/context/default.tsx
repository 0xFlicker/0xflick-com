import { FC, PropsWithChildren } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import { Provider as Web3Provider } from "features/web3/Provider";
import { Provider as AuthProvider } from "features/auth/hooks/useAuth";
import { ThemeProvider } from "@mui/material/styles";
import { Provider } from "react-redux";
import { Provider as ApolloProvider } from "graphql/Provider";
import { Provider as LocaleProvider } from "locales/hooks";
import { Provider as AffiliateProvider } from "features/affiliates/hooks/useManageAffiliates";
import { store, useAppSelector } from "app/store";
import { selectors as appbarSelectors } from "features/appbar/redux";
import { InitOptions } from "i18next";
import dark from "themes/dark";
import light from "themes/light";

export const StateAvailableContent: FC<PropsWithChildren<{}>> = ({
  children,
}) => {
  const isDarkMode = useAppSelector(appbarSelectors.darkMode);
  return (
    <ApolloProvider>
      <ThemeProvider theme={isDarkMode ? dark : light}>
        <Web3Provider>
          <AuthProvider>
            <AffiliateProvider>{children}</AffiliateProvider>
          </AuthProvider>
        </Web3Provider>
      </ThemeProvider>
    </ApolloProvider>
  );
};

export const DefaultProvider: FC<PropsWithChildren<{ i18n: InitOptions }>> = ({
  children,
  i18n,
}) => (
  <LocaleProvider i18n={i18n}>
    <Provider store={store}>
      <StateAvailableContent>
        <CssBaseline />
        {children}
      </StateAvailableContent>
    </Provider>
  </LocaleProvider>
);
