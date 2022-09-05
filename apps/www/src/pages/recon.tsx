import Head from "next/head";
import { Recon } from "layouts/Recon";
import { DefaultProvider } from "context/default";
import { getStaticProps } from "locales";
import { InitOptions } from "i18next";
import { NextPage } from "next";

export { getStaticProps };

const HomePage: NextPage<{ i18n: InitOptions }> = ({ i18n }) => {
  return (
    <DefaultProvider i18n={i18n}>
      <Head>
        <title>Recon</title>
      </Head>
      <Recon />
    </DefaultProvider>
  );
};
export default HomePage;
