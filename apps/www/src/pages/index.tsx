import Head from "next/head";
import { Main } from "layouts/Main";
import { getStaticProps } from "locales";
import { DefaultProvider } from "context/default";
import { InitOptions } from "i18next";
import { NextPage } from "next";
import { PleaseAxolotl } from "features/home/components/PleaseAxolotl";
import { randomUint8ArrayOfLength } from "features/axolotlValley/components/Preview";
import { useCallback, useState } from "react";
import { ListItemText, MenuItem, MenuList } from "@mui/material";
import { DarkModeSwitch } from "features/appbar/components/DarkModeSwitch";
import { Home } from "layouts/Home";

export { getStaticProps };

const HomePage: NextPage<{ i18n: InitOptions }> = ({ i18n }) => {
  

  return (
    <DefaultProvider i18n={i18n}>
      <Head>
        <title>0xflick</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Home />  
    </DefaultProvider>
  );
};
export default HomePage;
