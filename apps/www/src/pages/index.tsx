import Head from "next/head";
import { Home } from "layouts/Home";
import { DefaultProvider } from "context/default";

export default function HomePage() {
  return (
    <DefaultProvider>
      <Head>
        <title>0xflick</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Home />
    </DefaultProvider>
  );
}
