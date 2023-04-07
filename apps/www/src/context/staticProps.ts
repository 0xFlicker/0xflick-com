import { getStaticProps as getStaticLocaleProps } from "@0xflick/feature-locale";
import { i18n as I18nType } from "i18next";
import { GetStaticProps, NextPage } from "next";
import {
  getStaticProps as getStaticThemeProps,
  TTheme,
} from "@0xflick/feature-theme";
import { deepMerge } from "utils/object";

export const getStaticProps: GetStaticProps = async (context) => {
  return await getStaticThemeProps(context);
};

export interface IStaticProps {
  theme: TTheme;
}
