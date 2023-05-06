import { FC, ReactNode } from "react";
import { AppBar as MuiAppBar, Toolbar, Box } from "@mui/material";
import { Connect } from "@0xflick/feature-web3";
import { ChainSelector } from "@0xflick/feature-web3/src/components/ChainSelector";

export const AppBar: FC<{
  title?: ReactNode;
}> = ({ title }) => {
  return (
    <>
      <MuiAppBar color="default">
        <Toolbar>
          {title}
          <Box sx={{ flexGrow: 1 }} component="span" />
          <ChainSelector />
          <Connect />
        </Toolbar>
      </MuiAppBar>
    </>
  );
};
