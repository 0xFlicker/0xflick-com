import MenuList from "@mui/material/MenuList";
import { FC } from "react";
import { Main } from "./Main";
import { Hero } from "features/home/components/Hero";
import { SiteMenu } from "features/appbar/components/SiteMenu";

export const Home: FC = () => {
  return (
    <Main
      menu={
        <>
          <MenuList dense disablePadding>
            <SiteMenu />
          </MenuList>
        </>
      }
    >
      <Hero />
    </Main>
  );
};
