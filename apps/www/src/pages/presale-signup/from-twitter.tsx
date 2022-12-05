import Head from "next/head";
import { getStaticProps } from "@0xflick/feature-locale";
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
      <PreSaleSignup affiliate="0xa08ea173f778e4a264d3308385E6F046E691BbA7" />
    </DefaultProvider>
  );
};
export default PresaleSignupPage;
