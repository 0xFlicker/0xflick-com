import { getStaticProps as getStaticLocaleProps } from "@0xflick/feature-locale";
import { InitOptions } from "i18next";
import { GetStaticProps, NextPage } from "next";
import {
  getStaticProps as getStaticThemeProps,
  TTheme,
} from "@0xflick/feature-theme";
import { deepMerge } from "utils/object";

export const getStaticProps: GetStaticProps = async (context) => {
  const [locale, theme] = await Promise.all([
    getStaticLocaleProps(context),
    getStaticThemeProps(context),
  ]);
  return deepMerge(locale, theme);
};

export interface IStaticProps {
  i18n: InitOptions;
  theme: TTheme;
}
