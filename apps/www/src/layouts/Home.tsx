import { FC, useEffect, useRef, useState } from "react";
import { Box, Toolbar } from "@mui/material";
import { AppBar } from "features/appbar/components/appBar";
import { useAppDispatch } from "app/store";
import { actions as appbarActions } from "features/appbar/redux";
import { Please } from "features/home/components/Please";

export const Home: FC = () => {
  const targetRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(
      appbarActions.setDarkMode(
        window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches
      )
    );
  }, [dispatch]);
  const [height, setSize] = useState<number>(0);

  useEffect(() => {
    if (!toolbarRef.current) return;

    const clintRect = toolbarRef.current.getClientRects();
    setSize(window.innerHeight - clintRect[0].height);
    function onResize() {
      setSize(window.innerHeight - clintRect[0].height);
    }
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <>
      <AppBar />
      <Box
        ref={targetRef}
        component="main"
        display="flex"
        sx={{ flexFlow: "column", height: "100%" }}
      >
        <Toolbar ref={toolbarRef} sx={{ flex: "0 1 auto" }} />
        <Box component="div" display="flex" sx={{ flex: "1 1 auto", height }}>
          <Please />
        </Box>
      </Box>
    </>
  );
};
