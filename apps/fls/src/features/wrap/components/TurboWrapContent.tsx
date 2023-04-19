import { FC, useCallback, useMemo, useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Typography from "@mui/material/Typography";
import FormGroup from "@mui/material/FormGroup";
import TextField from "@mui/material/TextField";
import { useContractReads } from "wagmi";
import { SendTransactionResult } from "@wagmi/core";
import {
  testNftAddress,
  usePrepareWrappedNftWrap,
  useWrappedNftWrap,
  useWrappedNftWrapTo,
  usePrepareWrappedNftWrapTo,
} from "@/wagmi";
import Button from "@mui/material/Button";

import { useWeb3 } from "@0xflick/feature-web3";
import { BigNumber, utils } from "ethers";
import { Box, FormControlLabel, Switch } from "@mui/material";
import { TransactionProgress } from "@/components/TransactionProgress";
import { useAuth } from "@0xflick/feature-auth/src/hooks";
import { TokenSelect } from "./TokenSelect";

export const TurboWrapContent: FC<{
  tokenIds: BigNumber[];
  isApprovedForAll?: boolean;
  setApprovalForAll?: () => Promise<SendTransactionResult>;
  approveIsError: boolean;
  approveIsSuccess: boolean;
}> = ({
  tokenIds,
  approveIsError,
  approveIsSuccess,
  isApprovedForAll,
  setApprovalForAll,
}) => {
  const [transferTo, setTransferTo] = useState(false);
  const [sendTo, setSendTo] = useState<string>();

  const { selectedAddress } = useWeb3();

  const { config: configureWrappedNftWrap } = usePrepareWrappedNftWrap({
    enabled: isApprovedForAll && tokenIds.length > 0 && !transferTo,
    ...(selectedAddress &&
      isApprovedForAll && {
        args: [tokenIds],
      }),
  });

  const {
    writeAsync: wrappedNftWrap,
    isError: wrapIsError,
    isLoading: wrapIsLoading,
    isSuccess: wrapIsSuccess,
  } = useWrappedNftWrap(configureWrappedNftWrap);

  const { config: configureWrappedNftWrapTo } = usePrepareWrappedNftWrapTo({
    enabled:
      isApprovedForAll &&
      tokenIds.length > 0 &&
      transferTo &&
      !!sendTo &&
      utils.isAddress(sendTo),
    ...(selectedAddress &&
      transferTo &&
      !!sendTo &&
      utils.isAddress(sendTo) &&
      isApprovedForAll && {
        args: [sendTo as `0x${string}`, tokenIds],
      }),
  });

  const {
    writeAsync: wrappedNftWrapTo,
    isError: wrapToIsError,
    isLoading: wrapToIsLoading,
    isSuccess: wrapToIsSuccess,
  } = useWrappedNftWrapTo(configureWrappedNftWrapTo);

  const [wrapInProgress, setWrapInProgress] = useState(false);
  const [wrapTransactionResult, setWrappedTransactionResult] =
    useState<SendTransactionResult>();
  const onWrap = useCallback(async () => {
    try {
      setWrapInProgress(true);
      const response =
        transferTo && sendTo && utils.isAddress(sendTo)
          ? await wrappedNftWrapTo?.()
          : await wrappedNftWrap?.();
      setWrappedTransactionResult(response);
    } catch (e) {
      console.error(e);
      setWrappedTransactionResult(undefined);
      setWrapInProgress(false);
    }
  }, [sendTo, transferTo, wrappedNftWrap, wrappedNftWrapTo]);
  const onWrapSuccess = useCallback(() => {
    setWrapInProgress(false);
    setWrappedTransactionResult(undefined);
  }, []);
  const [approveInProgress, setApproveInProgress] = useState(false);
  const [approveTransactionResult, setApproveTransactionResult] =
    useState<SendTransactionResult>();
  const onApprove = useCallback(async () => {
    if (setApprovalForAll) {
      try {
        setApproveInProgress(true);
        const response = await setApprovalForAll();
        setApproveTransactionResult(response);
      } catch (e) {
        console.error(e);
        setApproveTransactionResult(undefined);
        setApproveInProgress(false);
      }
    }
  }, [setApprovalForAll]);
  const onApproveSuccess = useCallback(() => {
    setApproveInProgress(false);
    setApproveTransactionResult(undefined);
  }, []);
  return (
    <>
      <Card>
        <CardContent>
          <Typography variant="h5" component="div">
            Turbo Wrap
          </Typography>
          <Typography sx={{ mb: 1.5 }} color="text.secondary">
            Wrap all your NFTs in one click
          </Typography>
          <FormGroup>
            <FormControlLabel
              onClick={(event) => {
                event.preventDefault();
                setTransferTo(!transferTo);
              }}
              control={<Switch checked={transferTo} />}
              label={"Wrap and transfer"}
            />
            <TextField
              sx={{
                my: 1,
              }}
              label="Send wrapped tokens to"
              variant="outlined"
              disabled={!transferTo}
              onChange={(e) => {
                if (utils.isAddress(e.target.value)) {
                  setSendTo(e.target.value);
                }
              }}
            />
          </FormGroup>

          {(wrapInProgress || wrapTransactionResult) && (
            <TransactionProgress
              isError={wrapIsError}
              isSuccess={wrapIsSuccess}
              transactionResult={wrapTransactionResult}
              onConfirmed={onWrapSuccess}
            />
          )}
          {(approveInProgress || approveTransactionResult) && (
            <TransactionProgress
              isError={approveIsError}
              isSuccess={approveIsSuccess}
              transactionResult={approveTransactionResult}
              onConfirmed={onApproveSuccess}
            />
          )}
          {!(
            wrapInProgress ||
            wrapTransactionResult ||
            approveInProgress ||
            approveTransactionResult
          ) && (
            <Box sx={{ height: 32 }}>
              {isApprovedForAll === false && (
                <Typography variant="body2" color="text.warning">
                  You must approve the contract to wrap your tokens
                </Typography>
              )}
              {isApprovedForAll === true && (
                <>
                  {(() => {
                    if (
                      tokenIds.length &&
                      transferTo &&
                      sendTo &&
                      utils.isAddress(sendTo)
                    ) {
                      return (
                        <Typography variant="body2" color="text.secondary">
                          {`Send wrapped tokens to ${sendTo}`}
                        </Typography>
                      );
                    } else if (
                      transferTo &&
                      !(sendTo && utils.isAddress(sendTo))
                    ) {
                      return (
                        <Typography variant="body2" color="error">
                          Invalid address
                        </Typography>
                      );
                    } else if (tokenIds.length) {
                      return (
                        <Typography variant="body2" color="text.secondary">
                          Wrapped tokens will be sent back to your wallet
                        </Typography>
                      );
                    } else {
                      return null;
                    }
                  })()}
                </>
              )}
            </Box>
          )}
        </CardContent>
        <CardActions>
          {isApprovedForAll === false && (
            <Button onClick={onApprove}>Approve</Button>
          )}
          {tokenIds.length ? (
            <Button
              onClick={onWrap}
              disabled={
                !isApprovedForAll ||
                tokenIds.length === 0 ||
                (transferTo && !(sendTo && utils.isAddress(sendTo)))
              }
            >
              {`turbo wrap ${tokenIds.length} token${
                tokenIds.length ? "s" : ""
              }`}
            </Button>
          ) : null}
        </CardActions>
      </Card>
    </>
  );
};
