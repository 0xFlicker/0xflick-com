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
  testNftABI,
  testNftAddress,
  wrappedNftAddress,
  usePrepareTestNftSetApprovalForAll,
  useTestNftIsApprovedForAll,
  useTestNftSetApprovalForAll,
  usePrepareWrappedNftWrap,
  useWrappedNftWrap,
} from "@/wagmi";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import RemoveIcon from "@mui/icons-material/RemoveCircleOutline";
import CheckIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/CloseOutlined";

import { useWeb3 } from "@0xflick/feature-web3";
import { BigNumber } from "ethers";
import { Box } from "@mui/material";
import { TransactionProgress } from "@/components/TransactionProgress";
import { useAuth } from "@0xflick/feature-auth/src/hooks";
import { TokenSelect } from "./TokenSelect";

export const WrapCard: FC<{
  minTokenId: number;
  maxTokenId: number;
}> = ({ minTokenId, maxTokenId }) => {
  const [tokenIds, setTokenIds] = useState<string[]>([]);

  const { selectedAddress, currentChain } = useWeb3();
  const { isAuthenticated } = useAuth();
  const isValidToCheckApproval =
    selectedAddress &&
    currentChain &&
    (wrappedNftAddress as any)[currentChain?.id] !== undefined;
  const { data: isApprovedForAll, isFetched: isApprovedForAllFetched } =
    useTestNftIsApprovedForAll({
      enabled: isValidToCheckApproval,
      ...(isValidToCheckApproval && {
        args: [
          selectedAddress,
          (wrappedNftAddress as any)[currentChain?.id] as `0x${string}`,
        ],
      }),
    });
  const { config: configureSetApprovalForAll } =
    usePrepareTestNftSetApprovalForAll({
      enabled:
        isValidToCheckApproval && isApprovedForAllFetched && !isApprovedForAll,
      ...(isValidToCheckApproval &&
        isApprovedForAllFetched &&
        !isApprovedForAll && {
          args: [
            (wrappedNftAddress as any)[currentChain?.id] as `0x${string}`,
            true,
          ],
        }),
    });
  const {
    writeAsync: setApprovalForAll,
    isError: approveIsError,
    isLoading: approveIsLoading,
    isSuccess: approveIsSuccess,
  } = useTestNftSetApprovalForAll(configureSetApprovalForAll);
  const { config: configureWrappedNftWrap } = usePrepareWrappedNftWrap({
    enabled: isApprovedForAll,
    ...(selectedAddress &&
      isApprovedForAll && {
        args: [
          tokenIds
            .filter((tokenId) => tokenId !== null)
            .map((n) => BigNumber.from(n)) as BigNumber[],
        ],
      }),
  });

  const {
    writeAsync: wrappedNftWrap,
    isError: wrapIsError,
    isLoading: wrapIsLoading,
    isSuccess: wrapIsSuccess,
  } = useWrappedNftWrap(configureWrappedNftWrap);
  const { data: ownerOfAddress } = useContractReads({
    contracts: tokenIds.map((tokenIdStr) => {
      const tokenId = Number(tokenIdStr);
      return {
        abi: testNftABI,
        address: testNftAddress[5],
        functionName: "ownerOf",
        enabled:
          tokenIdStr !== null && tokenId >= minTokenId && tokenId <= maxTokenId,
        ...(Number.isInteger(tokenId) && {
          args: [BigNumber.from(tokenId)],
        }),
      };
    }) as {
      abi: typeof testNftABI;
      address: `0x${string}`;
      functionName: "ownerOf";
    }[],
  });

  // const addTokenId = useCallback(
  //   () => setTokenIds([...tokenIds, null]),
  //   [tokenIds]
  // );
  // const removeTokenId = useCallback(
  //   (index: number) => {
  //     setTokenIds([...tokenIds.slice(0, index), ...tokenIds.slice(index + 1)]);
  //   },
  //   [tokenIds]
  // );
  const validTokenIds = useMemo(() => {
    return tokenIds.map((value, index) => {
      const isError: boolean =
        value !== null &&
        // @ts-ignore
        (ownerOfAddress?.[index] !== selectedAddress ||
          // @ts-ignore
          ownerOfAddress?.[index] === undefined ||
          // @ts-ignore
          ownerOfAddress?.[index] === null ||
          // @ts-ignore
          ownerOfAddress?.[index] === "" ||
          // @ts-ignore
          ownerOfAddress?.[index] === "0x");
      return !isError;
    });
  }, [tokenIds, ownerOfAddress, selectedAddress]);

  const tokenIsDuplicate = useMemo(() => {
    // for every token, return false if unique or true if duplicate
    return tokenIds.map((tokenId, index) => {
      return tokenIds.filter((tokenId2) => tokenId === tokenId2).length > 1;
    });
  }, [tokenIds]);

  const anyError = useMemo(() => {
    return (
      tokenIds.filter((a) => a !== null).length === 0 ||
      validTokenIds.filter((a) => a === false).length > 0 ||
      tokenIsDuplicate.filter((a) => a === true).length > 0
    );
  }, [tokenIds, validTokenIds, tokenIsDuplicate]);
  const [wrapInProgress, setWrapInProgress] = useState(false);
  const [wrapTransactionResult, setWrappedTransactionResult] =
    useState<SendTransactionResult>();
  const onWrap = useCallback(async () => {
    if (wrappedNftWrap) {
      try {
        setWrapInProgress(true);
        const response = await wrappedNftWrap();
        setWrappedTransactionResult(response);
      } catch (e) {
        console.error(e);
        setWrappedTransactionResult(undefined);
        setWrapInProgress(false);
      }
    }
  }, [wrappedNftWrap]);
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
      <Card sx={{ minWidth: 480 }}>
        <CardContent>
          <Typography variant="h5" component="div">
            Wrap
          </Typography>
          <Typography sx={{ mb: 1.5 }} color="text.secondary">
            Select your tokens to wrap
          </Typography>

          {isAuthenticated && (
            <TokenSelect
              contractAddress={testNftAddress[5]}
              contractSlug="go-fame-lady"
              testnet
              userAddress={selectedAddress}
              onSelected={(tokenIds) => {
                setTokenIds(tokenIds);
              }}
              tokenIds={tokenIds}
            />
          )}
          {/* <FormGroup>
            {tokenIds.map((tokenId, index) => {
              return (
                <>
                  <TextField
                    sx={{ mb: 1 }}
                    key={index}
                    label="Token ID"
                    value={tokenId}
                    onChange={(e: any) => {
                      setTokenIds([
                        ...tokenIds.slice(0, index),
                        e.target.value,
                        ...tokenIds.slice(index + 1),
                      ]);
                    }}
                    InputProps={{
                      startAdornment:
                        tokenId === null ? (
                          <Box sx={{ width: 24, mr: 2 }} />
                        ) : validTokenIds[index] === true &&
                          tokenIsDuplicate[index] === false ? (
                          <CheckIcon sx={{ color: "success.main", mr: 2 }} />
                        ) : (
                          <CloseIcon sx={{ color: "error.main", mr: 2 }} />
                        ),
                      endAdornment: (
                        <IconButton
                          onClick={() => removeTokenId(index)}
                          disabled={tokenIds.length === 1}
                        >
                          <RemoveIcon />
                        </IconButton>
                      ),
                    }}
                    error={
                      validTokenIds[index] === false ||
                      tokenIsDuplicate[index] === true
                    }
                  />
                </>
              );
            })}
            {validTokenIds.some((value) => value === false) && (
              <Typography color="error">
                One or more token IDs are invalid
              </Typography>
            )}
            {tokenIsDuplicate.some((value) => value === true) && (
              <Typography color="error">
                One or more token IDs are duplicates
              </Typography>
            )}
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
          )} */}
        </CardContent>

        <CardActions>
          {isApprovedForAll === false && (
            <Button onClick={onApprove}>Approve</Button>
          )}
          {isApprovedForAll === true && !anyError && (
            <Button onClick={onWrap}>Wrap</Button>
          )}
        </CardActions>
      </Card>
    </>
  );
};
