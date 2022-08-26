import Head from "next/head";
import { Main } from "layouts/Main";
import { getStaticProps } from "locales";
import { DefaultProvider } from "context/default";
import { InitOptions } from "i18next";
import { NextPage } from "next";
import { MyTokens } from "layouts/MyTokens";

export { getStaticProps };

const MyTokensPage: NextPage<{ i18n: InitOptions }> = ({ i18n }) => {
  return (
    <DefaultProvider i18n={i18n}>
      <Head>
        <title>Nameflick Demo</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Demo />
    </DefaultProvider>
  );
};
export default MyTokensPage;
