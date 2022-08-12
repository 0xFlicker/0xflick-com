import {
  FC,
  MouseEventHandler,
  MouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";
import {
  AppBar as MuiAppBar,
  Button,
  Toolbar,
  Typography,
  Switch,
  FormGroup,
  FormControlLabel,
  Box,
  IconButton,
} from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
import NextImage from "next/image";
import { useAppDispatch, useAppSelector } from "app/store";
import {
  selectors as appbarSelectors,
  actions as appbarActions,
} from "features/appbar/redux";
import { ETheme, useSavedTheme } from "../hooks";
import { Connect } from "features/web3";
import { HomeMenu } from "./HomeMenu";

export const AppBar: FC<{
  onFlick?: MouseEventHandler;
  menu: ReactNode;
}> = ({ menu, onFlick }) => {
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
          <IconButton onClick={onFlick}>
            <NextImage src="/flick.png" width={40} height={40} />
          </IconButton>
          <Box sx={{ flexGrow: 1 }} component="span" />

          <Connect />
        </Toolbar>
      </MuiAppBar>
      <HomeMenu anchorEl={menuAnchorEl} handleClose={onMenuClose}>
        {menu}
      </HomeMenu>
    </>
  );
};
