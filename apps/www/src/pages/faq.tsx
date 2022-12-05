import Head from "next/head";
import { getStaticProps } from "@0xflick/feature-locale";
import { DefaultProvider } from "context/default";
import { InitOptions } from "i18next";
import { NextPage } from "next";
import { Faq } from "layouts/Faq";

export { getStaticProps };

const HomePage: NextPage<{ i18n: InitOptions }> = ({ i18n }) => {
  return (
    <DefaultProvider i18n={i18n}>
      <Head>
        <title>Nameflick FAQ</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Faq />
    </DefaultProvider>
  );
};
export default HomePage;
