import type { GetStaticProps } from "next";
import enCommon from "locales/en/common.json";
import enMint from "locales/en/mint.json";
import enAdmin from "locales/en/admin.json";
import { InitOptions } from "i18next";

export const defaultI18nConfig = (): InitOptions => ({
  lng: "en",
  debug: false,
  ns: ["common", "mint", "admin"],
  defaultNS: "common",
  resources: {
    en: {
      common: enCommon,
      mint: enMint,
      admin: enAdmin,
    },
  },
});

export interface I18nProps {
  i18n: InitOptions;
}
export const getStaticProps: GetStaticProps<I18nProps> = async () => {
  return {
    props: {
      i18n: defaultI18nConfig(),
    },
  };
};
