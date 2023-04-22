import { FC, useCallback, useEffect, useMemo, useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Typography from "@mui/material/Typography";
import FormGroup from "@mui/material/FormGroup";
import TextField from "@mui/material/TextField";
import { SendTransactionResult } from "@wagmi/core";
import {
  usePrepareWrappedNftWrap,
  useWrappedNftWrap,
  useWrappedNftWrapTo,
  usePrepareWrappedNftWrapTo,
  usePrepareFameLadySocietyWrap,
  useFameLadySocietyWrap,
  usePrepareFameLadySocietyWrapTo,
  useFameLadySocietyWrapTo,
  bulkMinterAddress,
  fameLadySocietyAddress,
} from "@/wagmi";
import Button from "@mui/material/Button";

import { useWeb3 } from "@0xflick/feature-web3";
import { BigNumber, utils } from "ethers";
import { Box, CircularProgress, FormControlLabel, Switch } from "@mui/material";
import { TransactionProgress } from "@/components/TransactionProgress";
import { useAuth } from "@0xflick/feature-auth/src/hooks";
import { TokenSelect } from "./TokenSelect";
import { MainnetTokenSelect } from "./MainnetTokenSelect";
import { DevTipModal, TipCloseReason } from "./DevTipModal";
import { useEnsAddress } from "wagmi";
import { CheckCircle } from "@mui/icons-material";

export const WrapCardContent: FC<{
  minTokenId: number;
  maxTokenId: number;
  isApprovedForAll?: boolean;
  setApprovalForAll?: () => Promise<SendTransactionResult>;
  approveIsError: boolean;
  approveIsSuccess: boolean;
  testnet?: boolean;
}> = ({
  approveIsError,
  approveIsSuccess,
  minTokenId,
  maxTokenId,
  isApprovedForAll,
  setApprovalForAll,
  testnet,
}) => {
  const [tokenIds, setTokenIds] = useState<string[]>([]);
  const [transferTo, setTransferTo] = useState(false);

  const [sendToInput, setSendToInput] = useState<string>();
  const [isTipRequested, setIsTipRequested] = useState(false);
  const [tipState, setTipState] = useState<{
    reason?: TipCloseReason;
    value?: BigNumber;
  }>({});
  const { data: sendTo, isLoading: ensAddressIsLoading } = useEnsAddress({
    name: sendToInput,
  });

  const { selectedAddress } = useWeb3();
  const { isAuthenticated } = useAuth();

  const { config: configureWrappedNftWrap } = usePrepareWrappedNftWrap({
    overrides: {
      value: tipState.value,
    },
    enabled: testnet && isApprovedForAll && tokenIds.length > 0 && !transferTo,
    ...(selectedAddress &&
      isApprovedForAll && {
        args: [
          tokenIds
            .filter((tokenId) => tokenId !== null)
            .map((n) => BigNumber.from(n)) as BigNumber[],
        ],
      }),
  });

  const testnetWrapWrite = useWrappedNftWrap(configureWrappedNftWrap);

  const { config: configureFameLadySocietyWrap } =
    usePrepareFameLadySocietyWrap({
      overrides: {
        value: tipState.value,
      },
      enabled:
        !testnet && isApprovedForAll && tokenIds.length > 0 && !transferTo,
      ...(selectedAddress &&
        isApprovedForAll && {
          args: [
            tokenIds
              .filter((tokenId) => tokenId !== null)
              .map((n) => BigNumber.from(n)) as BigNumber[],
          ],
        }),
    });

  const flsWrapWrite = useFameLadySocietyWrap(configureFameLadySocietyWrap);

  const {
    writeAsync: wrappedNftWrap,
    isError: wrapIsError,
    isLoading: wrapIsLoading,
    isSuccess: wrapIsSuccess,
  } = testnet ? testnetWrapWrite : flsWrapWrite;

  const { config: configureWrappedNftWrapTo } = usePrepareWrappedNftWrapTo({
    overrides: {
      value: tipState.value,
    },
    enabled:
      testnet &&
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
        args: [
          sendTo as `0x${string}`,
          tokenIds
            .filter((tokenId) => tokenId !== null)
            .map((n) => BigNumber.from(n)) as BigNumber[],
        ],
      }),
  });

  const testnetWrapToWrite = useWrappedNftWrapTo(configureWrappedNftWrapTo);

  const { config: configureFameLadySocietyWrapTo } =
    usePrepareFameLadySocietyWrapTo({
      overrides: {
        value: tipState.value,
      },
      enabled:
        !testnet &&
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
          args: [
            sendTo as `0x${string}`,
            tokenIds
              .filter((tokenId) => tokenId !== null)
              .map((n) => BigNumber.from(n)) as BigNumber[],
          ],
        }),
    });

  const flsWrapToWrite = useFameLadySocietyWrapTo(
    configureFameLadySocietyWrapTo
  );

  const {
    writeAsync: wrappedNftWrapTo,
    isError: wrapToIsError,
    isLoading: wrapToIsLoading,
    isSuccess: wrapToIsSuccess,
  } = testnet ? testnetWrapToWrite : flsWrapToWrite;

  const [wrapInProgress, setWrapInProgress] = useState(false);
  const [wrapTransactionResult, setWrappedTransactionResult] =
    useState<SendTransactionResult>();

  const onWrapSuccess = useCallback(() => {
    setWrapInProgress(false);
    setWrappedTransactionResult(undefined);
  }, []);
  const onRequestWrapTip = useCallback(() => {
    setIsTipRequested(true);
  }, []);
  const onHandleTipClose = useCallback(
    async (reason: TipCloseReason, tip?: BigNumber) => {
      setIsTipRequested(false);
      if (reason === "confirm") {
        setTipState({ reason, value: tip });
      }
    },
    []
  );

  useEffect(() => {
    if (
      tipState.reason === "confirm" &&
      // Keep trying until one of these is true
      ((transferTo && sendTo && utils.isAddress(sendTo) && wrappedNftWrapTo) ||
        wrappedNftWrap)
    ) {
      let wasCancelled = false;
      Promise.resolve().then(async () => {
        setTipState({});
        try {
          setWrapInProgress(true);
          const response =
            transferTo && sendTo && utils.isAddress(sendTo)
              ? await wrappedNftWrapTo?.()
              : await wrappedNftWrap?.();
          if (wasCancelled) {
            return;
          }
          setWrappedTransactionResult(response);
        } catch (e) {
          console.error(e);
          setWrappedTransactionResult(undefined);
          setWrapInProgress(false);
        }
      });
      return () => {
        wasCancelled = true;
      };
    }
  }, [tipState, transferTo, sendTo, wrappedNftWrapTo, wrappedNftWrap]);
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
            wrap
          </Typography>
          <Typography sx={{ mb: 1.5 }} color="text.secondary">
            select your tokens to wrap
          </Typography>
          <FormGroup>
            <FormControlLabel
              onClick={(event) => {
                event.preventDefault();
                setTransferTo(!transferTo);
              }}
              control={<Switch checked={transferTo} />}
              label={"wrap and transfer"}
            />
            <TextField
              sx={{
                my: 1,
              }}
              label="send wrapped tokens to"
              variant="outlined"
              disabled={!transferTo}
              onChange={(e) => {
                setSendToInput(e.target.value);
              }}
              InputProps={{
                endAdornment: ensAddressIsLoading ? (
                  <CircularProgress color="inherit" size={20} />
                ) : sendTo ? (
                  <CheckCircle color="success" />
                ) : null,
              }}
            />
          </FormGroup>
          {isAuthenticated && testnet ? (
            <TokenSelect
              contractAddress={bulkMinterAddress[5]}
              contractSlug={"go-fame-lady-1"}
              testnet
              userAddress={selectedAddress}
              onSelected={setTokenIds}
              maxTokenId={maxTokenId}
              minTokenId={minTokenId}
            />
          ) : (
            <MainnetTokenSelect onSelected={setTokenIds} />
          )}
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
            <Box component="div" sx={{ height: 32 }}>
              {isApprovedForAll === false && (
                <Typography variant="body2" color="text.warning">
                  you must approve the contract to wrap your tokens
                </Typography>
              )}
              {isApprovedForAll === true && (
                <>
                  {(() => {
                    switch (tokenIds.length) {
                      case 0:
                        return (
                          <Typography variant="body2" color="error">
                            select one or more tokens to wrap
                          </Typography>
                        );
                      case 1:
                        return (
                          <Typography variant="body2" color="text.secondary">
                            1 token selected
                          </Typography>
                        );
                      default:
                        return (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >{`${tokenIds.length} tokens selected`}</Typography>
                        );
                    }
                  })()}

                  {(() => {
                    if (
                      tokenIds.length &&
                      transferTo &&
                      sendTo &&
                      utils.isAddress(sendTo)
                    ) {
                      return (
                        <Typography variant="body2" color="text.secondary">
                          {`send wrapped tokens to ${sendTo}`}
                        </Typography>
                      );
                    } else if (
                      transferTo &&
                      !(sendTo && utils.isAddress(sendTo))
                    ) {
                      return (
                        <Typography variant="body2" color="error">
                          invalid address
                        </Typography>
                      );
                    } else if (tokenIds.length) {
                      return (
                        <Typography variant="body2" color="text.secondary">
                          wrapped tokens will be sent back to your wallet
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
          <Button
            onClick={onRequestWrapTip}
            disabled={
              !isApprovedForAll ||
              tokenIds.length === 0 ||
              (transferTo && !(sendTo && utils.isAddress(sendTo)))
            }
          >
            Wrap
          </Button>
        </CardActions>
      </Card>
      <DevTipModal
        handleClose={onHandleTipClose}
        open={isTipRequested}
        numberOfTokens={tokenIds.length}
      />
    </>
  );
};
