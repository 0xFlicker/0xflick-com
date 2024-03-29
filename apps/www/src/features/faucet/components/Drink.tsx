import { LoadingButton } from "@mui/lab";
import { Snackbar, Typography } from "@mui/material";
import { Send as SendIcon } from "@mui/icons-material";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { useLocale } from "@0xflick/feature-locale";
import { useDrinkFromFaucetMutation } from "../api";

export const Drink: FC<{
  token: string;
  to: string;
  setTxHash: (txHash: string) => void;
}> = ({ token, to, setTxHash }) => {
  const { t } = useLocale("common");
  const [open, setOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [requestDrink, { data, error, isLoading }] =
    // FIXME: use graphql
    useDrinkFromFaucetMutation();
  const onClick = useCallback(() => {
    if (token && to) {
      requestDrink({ token, to });
    }
  }, [requestDrink, to, token]);
  const remainingTime = useMemo(() => {
    const e = error as any;
    if (e?.data?.remainingTime) {
      const rtf1 = new Intl.RelativeTimeFormat("en", { style: "narrow" });
      return rtf1.format(e.data.remainingTime / 3600, "hours");
    }
  }, [error]);
  const remainingCount: number | undefined = data?.remainingCount;
  useEffect(() => {
    if (data?.txHash) {
      setOpen(true);
      setTxHash(data.txHash);
    }
  }, [data, setTxHash]);
  useEffect(() => {
    if (error) {
      setErrorOpen(true);
    }
  }, [error]);

  return (
    <>
      <LoadingButton
        loading={isLoading}
        disabled={!token || !to}
        endIcon={<SendIcon />}
        onClick={onClick}
      >
        {t("button_drink")}
      </LoadingButton>
      <Snackbar
        open={open}
        onClose={() => setOpen(false)}
        autoHideDuration={10000}
        message={
          <Typography>
            View transaction on Etherscan
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={`${process.env.NEXT_PUBLIC_BLOCK_EXPLORER}/tx/${data?.txHash}`}
            >
              {data?.txHash}
            </a>
            {/* {typeof remainingCount === "undefined"
              ? ""
              : ` (${remainingCount} remaining for this IP)`} */}
          </Typography>
        }
      />
      <Snackbar
        open={errorOpen}
        onClose={() => setErrorOpen(false)}
        autoHideDuration={5000}
        message={
          remainingTime ? (
            <Typography>{`Please wait ${remainingTime}`}</Typography>
          ) : (
            <Typography>Uh-oh something went wrong</Typography>
          )
        }
      />
    </>
  );
};
