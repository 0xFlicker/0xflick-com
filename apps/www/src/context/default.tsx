import { FC, PropsWithChildren } from "react";

import { ThemeProvider } from "@mui/material/styles";
import { Provider } from "react-redux";

import { store, useAppSelector } from "app/store";
import { selectors as appbarSelectors } from "features/appbar/redux";
import dark from "themes/dark";
import light from "themes/light";

export const StateAvailableContent: FC<PropsWithChildren<{}>> = ({
  children,
}) => {
  const isDarkMode = useAppSelector(appbarSelectors.darkMode);
  return (
    <ThemeProvider theme={isDarkMode ? dark : light}>{children}</ThemeProvider>
  );
};

export const DefaultProvider: FC<PropsWithChildren<{}>> = ({ children }) => (
  <Provider store={store}>
    <StateAvailableContent>{children}</StateAvailableContent>
  </Provider>
);
