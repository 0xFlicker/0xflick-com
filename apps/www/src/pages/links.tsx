import Head from "next/head";
import { getStaticProps } from "locales";
import { DefaultProvider } from "context/default";
import { InitOptions } from "i18next";
import { NextPage } from "next";
import { Links } from "layouts/Links";

export { getStaticProps };

const LinksPage: NextPage<{ i18n: InitOptions }> = ({ i18n }) => {
  return (
    <DefaultProvider i18n={i18n}>
      <Head>
        <title>Nameflick FAQ</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Links />
    </DefaultProvider>
  );
};
export default LinksPage;