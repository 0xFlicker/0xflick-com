import Head from "next/head";
import { Main } from "layouts/Main";
import { getStaticProps } from "locales";
import { DefaultProvider } from "context/default";
import { InitOptions } from "i18next";
import { NextPage } from "next";
import {
  Preview,
  randomUint8ArrayOfLength,
} from "features/axolotlValley/components/Preview";
import { useState, useCallback } from "react";
import { AxolotlValley } from "layouts/AxolotlValley";

export { getStaticProps };

const AxolotlValleyPage: NextPage<{ i18n: InitOptions }> = ({ i18n }) => {
  const [seed, setSeed] = useState<Uint8Array>(randomUint8ArrayOfLength(32));
  const onFlick = useCallback(() => {
    setSeed(randomUint8ArrayOfLength(32));
  }, []);
  return (
    <DefaultProvider i18n={i18n}>
      <Head>
        <title>0xflick - Axolotl Valley</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <AxolotlValley />
    </DefaultProvider>
  );
};
export default AxolotlValleyPage;
