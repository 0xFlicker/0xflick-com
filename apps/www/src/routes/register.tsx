import Head from "next/head";
import { DefaultProvider } from "context/default";
import { NextPage } from "next";
import type { IStaticProps } from "context/staticProps";
import { Register } from "layouts/Register";

export { getStaticProps } from "context/staticProps";

const FaqPage: NextPage<IStaticProps> = ({ i18n, theme }) => {
  return (
    <DefaultProvider i18n={i18n} initialTheme={theme}>
      <Head>
        <title>Nameflick FAQ</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Register />
    </DefaultProvider>
  );
};
export default FaqPage;
