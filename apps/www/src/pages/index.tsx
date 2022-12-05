import Head from "next/head";
import { getStaticProps } from "@0xflick/feature-locale";
import { DefaultProvider } from "context/default";
import { InitOptions } from "i18next";
import { NextPage } from "next";
import { Home } from "layouts/Home";

export { getStaticProps };

const HomePage: NextPage<{ i18n: InitOptions }> = ({ i18n }) => {
  return (
    <DefaultProvider i18n={i18n}>
      <Head>
        <title>Nameflick</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Home />
    </DefaultProvider>
  );
};
export default HomePage;
