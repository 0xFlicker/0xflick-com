import Head from "next/head";
import { getStaticProps } from "locales";
import { DefaultProvider } from "context/default";
import { InitOptions } from "i18next";
import { NextPage } from "next";
import { PreSaleSignup } from "layouts/PreSaleSignup";

export { getStaticProps };

const PresaleSignupPage: NextPage<{ i18n: InitOptions }> = ({ i18n }) => {
  return (
    <DefaultProvider i18n={i18n}>
      <Head>
        <title>Nameflick presale signup</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <PreSaleSignup affiliate="0x0DE9a66f0F9b714c5b987BDCb37A5E2EF1bDA67A" />
    </DefaultProvider>
  );
};
export default PresaleSignupPage;