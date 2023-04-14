import { FC, useCallback, useState, FormEventHandler } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import FormGroup from "@mui/material/FormGroup";
import TextField from "@mui/material/TextField";
import CardActions from "@mui/material/CardActions";
import Button from "@mui/material/Button";
import {
  useTestNftOwnerOf,
  useTestNftMint,
  usePrepareTestNftMint,
} from "@/wagmi";
import { BigNumber, constants } from "ethers";
import { useWeb3 } from "@0xflick/feature-web3";
import { TransactionProgress } from "@/components/TransactionProgress";
import { SendTransactionResult } from "@wagmi/core";

export const MintCard: FC = () => {
  const { selectedAddress, currentChain } = useWeb3();
  const [tokenId, setTokenId] = useState("");
  const enabled = !!selectedAddress && !!tokenId.length;
  const [mintProgress, setMintProgress] = useState(false);
  const { isSuccess: exists } = useTestNftOwnerOf({
    enabled,
    ...(enabled && {
      args: [BigNumber.from(tokenId)],
    }),
  });
  const { config } = usePrepareTestNftMint({
    enabled,
    ...(enabled && {
      args: [selectedAddress ?? constants.AddressZero, BigNumber.from(tokenId)],
    }),
  });
  const {
    isIdle,
    isError,
    isSuccess,
    isLoading,
    writeAsync: onMintAsync,
  } = useTestNftMint(config);
  const [transactionResult, setTransactionResult] =
    useState<SendTransactionResult>();
  const onMint = useCallback(async () => {
    if (onMintAsync) {
      try {
        setMintProgress(true);
        const response = await onMintAsync();
        setTransactionResult(response);
      } catch (e) {
        console.error(e);
        setTransactionResult(undefined);
        setMintProgress(false);
      }
    }
  }, [onMintAsync]);

  const onUpdateTokenId = useCallback((e: any) => {
    setTokenId(e.target.value);
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
            value={tokenId}
            onChange={onUpdateTokenId}
            margin="normal"
            fullWidth
            helperText="Token ID"
            error={exists}
          />
        </FormGroup>
        {exists && (
          <Typography sx={{ mb: 1.5 }} color="text.error">
            Token already exists
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
