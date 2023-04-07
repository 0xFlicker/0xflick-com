import { createContext, FC, PropsWithChildren, useContext } from "react";
import type { i18n as I18nType, TFunction } from "i18next";
import i18next from "i18next";
import { useTranslation } from "react-i18next";

interface IContext {
  i18n: I18nType;
}
const LocaleContext = createContext<IContext>({ i18n: i18next });

export const Provider: FC<PropsWithChildren<Partial<IContext>>> = ({
  children,
  i18n,
}) => {
  return (
    <LocaleContext.Provider value={i18n ? { i18n } : { i18n: i18next }}>
      {children}
    </LocaleContext.Provider>
  );
};

export function useLocale(ns?: string | string[]): {
  t: TFunction<string | string[], undefined>;
} {
  const { i18n } = useContext(LocaleContext);
  return useTranslation(ns, { i18n });
}
