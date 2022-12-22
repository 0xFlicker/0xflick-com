import Head from "next/head";
import { PreSaleSignup } from "layouts/PreSaleSignup";
import { NextPage } from "next";
import { DefaultProvider } from "context/default";
import type { IStaticProps } from "context/staticProps";

export { getStaticProps } from "context/staticProps";

const Page: NextPage<IStaticProps> = ({ i18n, theme }) => {
  return (
    <DefaultProvider i18n={i18n} initialTheme={theme}>
      <Head>
        <title>Nameflick presale signup</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <PreSaleSignup affiliate="0xa08ea173f778e4a264d3308385E6F046E691BbA7" />
    </DefaultProvider>
  );
};
export default Page;
