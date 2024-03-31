import { FC, useCallback, useState, FormEventHandler } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import FormGroup from "@mui/material/FormGroup";
import TextField from "@mui/material/TextField";
import CardActions from "@mui/material/CardActions";
import Button from "@mui/material/Button";
import { useWriteBulkMinterMint } from "@/wagmi";
import { BigNumber, constants } from "ethers";
import { TransactionProgress } from "@/components/TransactionProgress";
import { SendTransactionResult } from "@wagmi/core";
import { useAccount } from "wagmi";

export const MintCard: FC = () => {
  const { address: selectedAddress, chain: currentChain } = useAccount();
  const [count, setCount] = useState("");
  const enabled =
    !!selectedAddress &&
    !!count.length &&
    count !== "0" &&
    Number.isInteger(Number(count));
  const [mintProgress, setMintProgress] = useState(false);
  // const { config } = usePrepareBulkMinterMint({
  //   enabled,
  //   ...(enabled && {
  //     args: [BigNumber.from(count)],
  //   }),
  // });
  const {
    isIdle,
    isError,
    isSuccess,
    isPending: isLoading,
    writeContractAsync: onMintAsync,
  } = useWriteBulkMinterMint(config);
  const [transactionResult, setTransactionResult] =
    useState<SendTransactionResult>();
  const onMint = useCallback(async () => {
    if (onMintAsync) {
      try {
        setMintProgress(true);
        const response = await onMintAsync({
          args: [BigInt(count)],
        });
        setTransactionResult(response);
      } catch (e) {
        console.error(e);
        setTransactionResult(undefined);
        setMintProgress(false);
      }
    }
  }, [count, onMintAsync]);

  const countError =
    count.length && (count === "0" || !Number.isInteger(Number(count)));

  const onUpdateTokenId = useCallback((e: any) => {
    setCount(e.target.value);
  }, []);
  const onSubmit: FormEventHandler = useCallback(
    (e) => {
      e.preventDefault();
      onMint?.();
    },
    [onMint]
  );
  const onClick = useCallback(() => {
    onMint?.();
  }, [onMint]);
  const onMintSuccess = useCallback(() => {
    setMintProgress(false);
    setTransactionResult(undefined);
  }, []);

  return currentChain?.id === 5 ? (
    <Card>
      <CardContent>
        <Typography variant="h5" component="div">
          Mint testnet FLS
        </Typography>
        <Typography sx={{ mb: 1.5 }} color="text.secondary">
          For testing purposes, any available token ID can be minted
        </Typography>
        <FormGroup onSubmit={onSubmit}>
          <TextField
            value={count}
            onChange={onUpdateTokenId}
            margin="normal"
            fullWidth
            helperText="Mint count"
            error={!!countError}
          />
        </FormGroup>
        {!!countError && (
          <Typography sx={{ mb: 1.5 }} color="text.error">
            Invalid count
          </Typography>
        )}
        {(mintProgress || transactionResult) && (
          <TransactionProgress
            isError={isError}
            isSuccess={isSuccess}
            transactionResult={transactionResult}
            onConfirmed={onMintSuccess}
          />
        )}
      </CardContent>
      <CardActions>
        <Button size="small" onClick={onClick}>
          Mint
        </Button>
      </CardActions>
    </Card>
  ) : null;
};
