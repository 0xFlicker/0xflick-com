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
import { AppBar } from "@/features/appbar/components/appBar";

export const Main: FC<
  PropsWithChildren<{
    onFlick?: MouseEventHandler;
    menu: ReactNode;
    title?: ReactNode;
  }>
> = ({ children, menu, title, onFlick }) => {
  const targetRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <AppBar menu={menu} title={title} />
      <Box
        ref={targetRef}
        component="main"
        display="flex"
        sx={{
          backgroundColor: "background.default",
          flexFlow: "column",
          height: "100%",
        }}
      >
        <Toolbar ref={toolbarRef} sx={{ flex: "0 1 auto" }} />
        <Box component="div" display="flex" sx={{ flex: "1 1 auto" }}>
          {children}
        </Box>
      </Box>
    </>
  );
};
