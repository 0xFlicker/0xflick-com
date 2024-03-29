"use client";

import {
  FC,
  PropsWithChildren,
  useEffect,
  useRef,
  useState,
  MouseEventHandler,
  ReactNode,
} from "react";
import { Box, Toolbar } from "@mui/material";
import { AppBar } from "./AppBar";

export const Main: FC<
  PropsWithChildren<{
    onFlick?: MouseEventHandler;
    menu?: ReactNode;
    title?: ReactNode;
  }>
> = ({ children, menu, title, onFlick }) => {
  return (
    <>
      <AppBar title={title} />
      <Box
        component="main"
        display="flex"
        sx={{ flexFlow: "column", height: "100%" }}
      >
        <Toolbar sx={{ flex: "0 1 auto" }} />
        <Box component="div" display="flex" sx={{ flex: "1 1 auto" }}>
          {children}
        </Box>
      </Box>
    </>
  );
};
