import type { GetStaticProps } from "next";
import enCommon from "locales/en/common.json";
import enMint from "locales/en/mint.json";
import enAdmin from "locales/en/admin.json";
import { InitOptions } from "i18next";

export const getStaticProps: GetStaticProps<{
  i18n: InitOptions;
}> = async () => {
  return {
    props: {
      i18n: {
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
      },
    },
  };
};
