import Head from "next/head";
import { DefaultProvider } from "@/context/default";
import { NextPage } from "next";
import { useLocale } from "@0xflick/feature-locale";
import { Lips } from "@/features/reveal/components/Lips";

const RevealPage: NextPage<{}> = () => {
  const { t } = useLocale(["common"]);
  const title = "Fame Lady Society";
  const description = "Unstoppable";
  return (
    <DefaultProvider>
      <Head>
        <title>Fame Lady Society</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta property="og:site_name" content="#itsawrap" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta
          property="og:image"
          content="https://fameladysociety.com/images/fls-wrap.gif"
        />
        <meta property="twitter:title" content={title} />
        <meta property="twitter:description" content={description} />
        <meta content="verification" name="LR1011" />
        <meta
          property="twitter:image"
          content="https://fameladysociety.com/images/Flsociety_morg_mock.jpeg"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:creator" content="@FameLadySociety" />
      </Head>
      <Lips />
    </DefaultProvider>
  );
};
export default RevealPage;
