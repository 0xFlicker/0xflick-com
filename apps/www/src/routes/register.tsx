import Head from "next/head";
import { DefaultProvider } from "context/default";
import { NextPage } from "next";
import type { IStaticProps } from "context/staticProps";
import { Register } from "layouts/Register";

export { getStaticProps } from "context/staticProps";

const FaqPage: NextPage<IStaticProps> = ({ theme }) => {
  return (
    <DefaultProvider initialTheme={theme}>
      <Head>
        <title>Nameflick register</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Register />
    </DefaultProvider>
  );
};
export default FaqPage;
