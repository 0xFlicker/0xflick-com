import {
  FC,
  MouseEventHandler,
  MouseEvent,
  useCallback,
  useState,
  ReactNode,
} from "react";
import {
  AppBar as MuiAppBar,
  Toolbar,
  Box,
  IconButton,
  Typography,
} from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
import NextImage from "next/image";
import { Connect } from "@0xflick/feature-web3";
import { HomeMenu } from "./HomeMenu";
import { ChainSelector } from "@0xflick/feature-web3/src/components/ChainSelector";

export const AppBar: FC<{
  onFlick?: MouseEventHandler;
  menu: ReactNode;
  title?: ReactNode;
}> = ({ menu, title, onFlick }) => {
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
          <IconButton
            onClick={onFlick}
            title={onFlick ? "flick me" : ""}
            sx={{ ml: 2 }}
          >
            <NextImage src="/flick.png" width={40} height={40} />
          </IconButton>
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
