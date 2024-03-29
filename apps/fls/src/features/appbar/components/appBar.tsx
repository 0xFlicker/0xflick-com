import {
  FC,
  MouseEventHandler,
  MouseEvent,
  useCallback,
  useState,
  ReactNode,
} from "react";
import { AppBar as MuiAppBar, Toolbar, Box, Typography } from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
import { Connect } from "@0xflick/feature-web3";
import { HomeMenu } from "./HomeMenu";
import { ChainSelector } from "@0xflick/feature-web3/src/components/ChainSelector";
import { TwitterIcon } from "@/components/icons/twitter";
import { WrappedLink } from "@0xflick/components/src/WrappedLink";

export const AppBar: FC<{
  menu: ReactNode;
  title?: ReactNode;
}> = ({ menu, title }) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState<Element | null>(null);

  const onMenuClose = useCallback(() => {
    setMenuAnchorEl(null);
  }, []);
  const handleMenu = useCallback((event: MouseEvent) => {
    setMenuAnchorEl(event.currentTarget);
  }, []);
  return (
    <>
      <MuiAppBar color="default">
        <Toolbar>
          <MenuIcon onClick={handleMenu} />
          {title}
          <Box sx={{ flexGrow: 1 }} component="span" />
          <ChainSelector />
          <Connect />
        </Toolbar>
      </MuiAppBar>
      <HomeMenu anchorEl={menuAnchorEl} handleClose={onMenuClose}>
        {menu}
      </HomeMenu>
    </>
  );
};
