import Head from "next/head";
import { getStaticProps } from "locales";
import { DefaultProvider } from "context/default";
import { InitOptions } from "i18next";
import { NextPage } from "next";
import { PreSaleMint } from "layouts/PreSaleMint";

export { getStaticProps };

const PresaleMintPage: NextPage<{ i18n: InitOptions }> = ({ i18n }) => {
  return (
    <DefaultProvider i18n={i18n}>
      <Head>
        <title>0xflick</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <PreSaleMint />
    </DefaultProvider>
  );
};
export default PresaleMintPage;
