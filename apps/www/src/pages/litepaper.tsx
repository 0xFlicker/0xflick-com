import Head from "next/head";
import { getStaticProps } from "@0xflick/feature-locale";
import { DefaultProvider } from "context/default";
import { InitOptions } from "i18next";
import { NextPage } from "next";
import { LitePaper as LitePaperComponent } from "layouts/LitePaper";

export { getStaticProps };

const LitePaper: NextPage<{ i18n: InitOptions }> = ({ i18n }) => {
  return (
    <DefaultProvider i18n={i18n}>
      <Head>
        <title>0xflick</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <LitePaperComponent />
    </DefaultProvider>
  );
};
export default LitePaper;
