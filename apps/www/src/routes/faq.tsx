import Head from "next/head";
import { DefaultProvider } from "context/default";
import { NextPage } from "next";
import { Faq } from "layouts/Faq";
import type { IStaticProps } from "context/staticProps";

export { getStaticProps } from "context/staticProps";

const FaqPage: NextPage<IStaticProps> = ({ theme }) => {
  return (
    <DefaultProvider initialTheme={theme}>
      <Head>
        <title>Nameflick FAQ</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Faq />
    </DefaultProvider>
  );
};
export default FaqPage;
