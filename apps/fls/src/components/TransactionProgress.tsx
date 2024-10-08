import { FC, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import CircularProgress from "@mui/material/CircularProgress";
import CircleIcon from "@mui/icons-material/Circle";
import Stack from "@mui/material/Stack";
import { useTransaction } from "wagmi";

// Transactions have three steps:
// 1. Waiting for the user to sign the transaction
// 2. Waiting for the transaction to be submitted
// 3. Waiting for the transaction to be confirmed
// This component displays a linear progress bar over two circles to indicate:
// 1. The user has signed the transaction (33%)
// 2. The transaction has been mined (66%) and is waiting for confirmation
// 3. The transaction has been confirmed (100%)

export const TransactionProgress: FC<{
  isError: boolean;
  isSuccess: boolean;
  transactionHash?: `0x${string}`;
  onConfirmed?: () => void;
}> = ({ isError, isSuccess, transactionHash, onConfirmed }) => {
  const [isMined, setIsMined] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { data: transactionResult } = useTransaction({
    hash: transactionHash,
  });
  useEffect(() => {
    // if (transactionResult?.hash) {
    //   setIsSubmitted(true);
    //   transactionResult?.wait().then(() => {
    //     setIsMined(true);
    //     setTimeout(() => {
    //       onConfirmed?.();
    //     }, 1000);
    //   });
    // }
    console.log(transactionResult);
  }, [onConfirmed, transactionResult]);
  const status = isError
    ? "error"
    : isSuccess
      ? "success"
      : isMined
        ? "mined"
        : "signing";

  const progress = !transactionResult
    ? 0 // waiting to submit
    : isMined
      ? 100 // mined
      : isSubmitted
        ? 66 // submitted
        : 33; // signing

  return (
    <Box
      component="div"
      sx={{ position: "relative", display: "flex", alignItems: "center" }}
    >
      <Stack sx={{ position: "relative", mr: 1 }} alignItems="center">
        <CircularProgress
          size={32}
          thickness={5}
          sx={{
            color: status === "signing" ? "primary.main" : "action.disabled",
          }}
        />
        <Box
          component="div"
          sx={{
            position: "absolute",
            zIndex: 2,
          }}
        >
          <CircleIcon
            color={status === "signing" ? "primary" : "disabled"}
            sx={{ fontSize: "2rem" }}
          />
        </Box>
      </Stack>
      <Box component="div" sx={{ position: "relative", flexGrow: 1 }}>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{ zIndex: 1 }}
        />
        <Box
          component="div"
          sx={{
            position: "absolute",
            left: "33%",
            transform: "translate(-50%, -50%)",
            zIndex: 2,
          }}
        >
          <CircleIcon
            color={status === "signing" ? "primary" : "action"}
            sx={{ fontSize: "1rem" }}
          />
        </Box>
        <Box
          component="div"
          sx={{
            position: "absolute",
            left: "66%",
            transform: "translate(-50%, -50%)",
            zIndex: 2,
          }}
        >
          <CircleIcon
            color={status === "mined" ? "primary" : "action"}
            sx={{ fontSize: "1rem" }}
          />
        </Box>
      </Box>
    </Box>
  );
};
