import type { GetStaticProps } from "next";
import enCommon from "./en/common.json";
import enMint from "./en/mint.json";
import enAdmin from "./en/admin.json";
import enUser from "./en/user.json";
import { InitOptions } from "i18next";

export const defaultI18nConfig = (): InitOptions => ({
  lng: "en",
  debug: false,
  ns: ["common", "mint", "admin", "user"],
  defaultNS: "common",
  resources: {
    en: {
      common: enCommon,
      mint: enMint,
      admin: enAdmin,
      user: enUser,
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

export * from "./hooks";
