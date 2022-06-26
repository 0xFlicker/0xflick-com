import Head from "next/head";
import { Recon } from "layouts/Recon";
import { DefaultProvider } from "context/default";

export default function HomePage() {
  return (
    <DefaultProvider>
      <Head>
        <title>0xflick</title>
      </Head>
      <Recon />
    </DefaultProvider>
  );
}
