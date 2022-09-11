import { FC, ReactNode, PropsWithChildren, useCallback } from "react";
import { Button, ButtonProps, Snackbar } from "@mui/material";
import { useState } from "react";

export const CopyToClipboardButton: FC<
  PropsWithChildren<{
    text: string;
    ButtonProps?: ButtonProps;
  }>
> = ({ children, text, ButtonProps }) => {
  const [open, setOpen] = useState(false);
  const handleClick = useCallback(() => {
    setOpen(true);
    window.navigator.clipboard.writeText(text);
  }, [text]);
  return (
    <>
      <Button variant="text" {...ButtonProps} onClick={handleClick}>
        {children}
      </Button>
      <Snackbar
        open={open}
        onClose={() => setOpen(false)}
        autoHideDuration={2000}
        message="Copied to clipboard"
      />
    </>
  );
};
