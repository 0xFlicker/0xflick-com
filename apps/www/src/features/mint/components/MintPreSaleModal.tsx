import { FC, useEffect, useState, useCallback, useMemo } from "react";
import {
  Backdrop,
  Box,
  Button,
  Card,
  CardActions,
  CardHeader,
  CardContent,
  Slider,
  Modal,
  Typography,
  LinearProgress,
  CircularProgress,
  IconButton,
} from "@mui/material";
import { Refresh as RefreshIcon } from "@mui/icons-material";
import { Fade } from "transitions/Fade";
import { useLocale } from "locales/hooks";
import { useAppDispatch, useAppSelector } from "app/store";
import { selectors as web3Selectors } from "@0xflick/feature-web3";
import { formatAddressShort } from "utils/formatter";
import {
  usePreSaleMinted,
  usePreSaleMaxMintPerAccount,
  usePreSaleActive,
} from "../hooks";
import {
  MintPreSaleModalStep,
  actions as mintActions,
  selectors as mintSelectors,
} from "../redux";
import { useLazyPreSaleSignatureQuery } from "../api";
import { FetchBaseQueryError, skipToken } from "@reduxjs/toolkit/query";
import { SerializedError } from "@reduxjs/toolkit";
import { useERC721 } from "features/nfts/hooks";
import { utils } from "ethers";
import { useSavedToken, useAuth } from "features/auth/hooks";

const MintPreSaleSubmitContent: FC<{
  address?: string;
  count: number;
  isError: boolean;
  isFetching: boolean;
  isLoading: boolean;
  isSuccess: boolean;
  error?: FetchBaseQueryError | SerializedError;
}> = ({ address, count, isError, isFetching, isLoading, isSuccess, error }) => {
  const { t } = useLocale(["mint"]);
  if (isFetching || isLoading) {
    <Box display="flex" flexDirection="column" justifyContent="center">
      <CircularProgress variant="indeterminate" />
    </Box>;
  }
  if (isError && error) {
    if ("status" in error && error.status === 404) {
      return (
        <Typography sx={{ my: 2, mx: 8 }} textAlign="center" color="error">
          {t("mint_pre_sale_signature_error_404", {
            ns: "mint",
          })}
        </Typography>
      );
    }
    if ("status" in error && error.status === 403) {
      return (
        <Typography sx={{ my: 2, mx: 8 }} textAlign="center" color="error">
          {t("mint_pre_sale_signature_error_403", {
            ns: "mint",
          })}
        </Typography>
      );
    }
    if ("status" in error && error.status === 400) {
      return (
        <Typography sx={{ my: 2, mx: 8 }} textAlign="center" color="error">
          {t("mint_pre_sale_signature_error_400", {
            ns: "mint",
          })}
        </Typography>
      );
    }
    if ("status" in error && error.status === 500) {
      return (
        <Typography sx={{ my: 2, mx: 8 }} textAlign="center" color="error">
          {t("mint_pre_sale_signature_error_500", {
            ns: "mint",
          })}
        </Typography>
      );
    }
    return (
      <Typography sx={{ my: 2, mx: 8 }} textAlign="center" color="error">
        {t("mint_pre_sale_signature_error_unknown", {
          ns: "mint",
        })}
      </Typography>
    );
  }
  if (isSuccess) {
    return (
      <Typography sx={{ my: 2, mx: 8 }} textAlign="center" color="text.primary">
        {t("mint_pre_sale_signature_success", {
          ns: "mint",
          address: formatAddressShort(address),
          amount: count,
          count,
        })}
      </Typography>
    );
  }
  return (
    <>
      <Typography sx={{ my: 2, mx: 8 }} color="text.primary" textAlign="center">
        {t("mint_pre_sale_signature_pending", {
          ns: "mint",
          address: formatAddressShort(address),
          amount: count,
          count,
        })}
      </Typography>
      <Box display="flex" justifyContent="center">
        <CircularProgress variant="indeterminate" />
      </Box>
    </>
  );
};

export enum MintPreSaleCloseReason {
  SUCCESS = "success",
  ERROR = "error",
  CANCELLED = "cancelled",
  CANCELLED_DURING_TRANSACTION = "cancelled_during_transaction",
}

interface IProps {
  open: boolean;
  handleClose: (reason?: MintPreSaleCloseReason) => void;
}

export const MintPreSaleModal: FC<IProps> = ({ open, handleClose }) => {
  const { t } = useLocale(["mint", "common"]);
  const { signIn, isAuthenticated, isAnonymous } = useAuth();
  const [submitAbortController, setSubmitAbortController] =
    useState<AbortController>();
  const step = useAppSelector(mintSelectors.preSaleStep);
  const { contract } = useERC721(true);
  const address = useAppSelector(web3Selectors.address);
  const dispatch = useAppDispatch();
  const [amount, setAmount] = useState(0);
  const [txHash, setTxHash] = useState<string | undefined>();

  const setStep = useCallback(
    (step: MintPreSaleModalStep) => {
      dispatch(mintActions.preSaleStep(step));
    },
    [dispatch]
  );
  useEffect(() => {
    if (step === MintPreSaleModalStep.UNKNOWN) {
      if (isAuthenticated) {
        setStep(MintPreSaleModalStep.IS_ACTIVE);
      } else {
        setStep(MintPreSaleModalStep.AUTHENTICATE);
      }
    }
  }, [setStep, step, isAuthenticated]);
  useEffect(() => {
    if (step === MintPreSaleModalStep.AUTHENTICATE && isAuthenticated) {
      setStep(MintPreSaleModalStep.IS_ACTIVE);
    }
  }, [setStep, step, isAuthenticated]);
  const {
    isFetching: isPreSaleMaxMintPerAccountFetching,
    isFetched: isPreSaleMaxMintPerAccountFetched,
    preSaleMaxMintPerAccount,
    refresh: refreshPreSaleMaxMintPerAccount,
  } = usePreSaleMaxMintPerAccount();

  const {
    isFetching: isPresaleActiveFetching,
    isFetched: isPresaleActiveFetched,
    preSaleActive: isPreSaleActive,
    refresh: refreshPresaleActive,
  } = usePreSaleActive();

  const {
    preSaleMinted,
    error: availableMintsError,
    isFetched: isAvailableMintsFetched,
    isFetching: isAvailableMintsFetching,
    refetch: refreshAvailableMints,
  } = usePreSaleMinted(address);

  // If all contract data is fetched, we can calculate the available presale mints
  const availableMints = useMemo(() => {
    if (
      isPreSaleMaxMintPerAccountFetched &&
      isAvailableMintsFetched &&
      typeof preSaleMaxMintPerAccount === "number" &&
      typeof preSaleMinted === "number"
    ) {
      return preSaleMaxMintPerAccount - preSaleMinted;
    }
    return undefined;
  }, [
    isAvailableMintsFetched,
    isPreSaleMaxMintPerAccountFetched,
    preSaleMaxMintPerAccount,
    preSaleMinted,
  ]);

  useEffect(() => {
    if (isAvailableMintsFetched && typeof availableMints === "number") {
      setAmount(availableMints);
    }
  }, [isAvailableMintsFetched, availableMints]);

  const [fetch, signatureQuery] = useLazyPreSaleSignatureQuery();
  const doSubmit = useCallback(
    (abortSignal?: AbortSignal) => {
      if (
        signatureQuery.isSuccess &&
        signatureQuery.data &&
        contract &&
        address
      ) {
        setStep(MintPreSaleModalStep.SUBMIT);
        contract
          .presaleMint(
            address,
            utils.hexZeroPad(utils.hexlify(signatureQuery.data.nonce), 32),
            amount,
            signatureQuery.data.signature
          )
          .then(async (receipt) => {
            if (abortSignal?.aborted) {
              return;
            }
            setStep(MintPreSaleModalStep.TRANSACTION);
            setTxHash(receipt.hash);
            await contract.provider.waitForTransaction(receipt.hash);
            setStep(MintPreSaleModalStep.SUCCESS);
          })
          .catch((error) => {
            console.error(error);
            if (abortSignal?.aborted) {
              return;
            }
            setStep(MintPreSaleModalStep.REJECTED);
          });
      }
    },
    [
      address,
      amount,
      contract,
      setStep,
      signatureQuery.data,
      signatureQuery.isSuccess,
    ]
  );

  const resubmit = useCallback(() => {
    setStep(MintPreSaleModalStep.SIGNATURE);
  }, [setStep]);
  useEffect(() => {
    if (step === MintPreSaleModalStep.SIGNATURE) {
      const abortController = new AbortController();
      doSubmit(abortController.signal);
      setSubmitAbortController(abortController);
    }
  }, [step, doSubmit]);
  useEffect(() => {
    if (
      step !== MintPreSaleModalStep.SUBMIT &&
      step !== MintPreSaleModalStep.SIGNATURE &&
      step !== MintPreSaleModalStep.TRANSACTION
    ) {
      submitAbortController?.abort();
    }
  }, [step, submitAbortController]);
  const { savedToken: token } = useSavedToken();
  const enterSignatureStep = useCallback(() => {
    if (address) {
      setStep(MintPreSaleModalStep.SIGNATURE);
      fetch({
        address,
        token,
      });
    }
  }, [address, fetch, setStep, token]);
  const refresh = useCallback(() => {
    setStep(MintPreSaleModalStep.AUTHENTICATE);
    refreshPreSaleMaxMintPerAccount();
    refreshPresaleActive();
    setTxHash(undefined);
    if (address) refreshAvailableMints(address);
    if (signatureQuery.isSuccess && address)
      fetch({
        address,
        token,
      });
  }, [
    address,
    token,
    fetch,
    refreshAvailableMints,
    refreshPreSaleMaxMintPerAccount,
    refreshPresaleActive,
    setStep,
    signatureQuery.isSuccess,
  ]);
  useEffect(() => {
    if (
      step === MintPreSaleModalStep.IS_ACTIVE &&
      isPresaleActiveFetched &&
      isPreSaleActive
    ) {
      setStep(MintPreSaleModalStep.ALLOCATION);
    }
  }, [step, isPresaleActiveFetched, isPreSaleActive, setStep]);
  const subheader = useMemo(() => {
    return t(`mint_modal_presale_${step}_subheader`, {
      ns: "mint",
      defaultValue: step.toLowerCase(),
    });
  }, [step, t]);
  const onCloseWithReason = useCallback(() => {
    let cancelledReason: MintPreSaleCloseReason;
    switch (step) {
      case MintPreSaleModalStep.TRANSACTION:
        cancelledReason = MintPreSaleCloseReason.CANCELLED_DURING_TRANSACTION;
        break;
      case MintPreSaleModalStep.SUCCESS:
        cancelledReason = MintPreSaleCloseReason.SUCCESS;
        break;
      case MintPreSaleModalStep.FAILED:
        cancelledReason = MintPreSaleCloseReason.ERROR;
        break;
      case MintPreSaleModalStep.REJECTED:
        cancelledReason = MintPreSaleCloseReason.ERROR;
        break;
      default:
        cancelledReason = MintPreSaleCloseReason.CANCELLED;
        break;
    }
    handleClose(cancelledReason);
  }, [handleClose, step]);

  return (
    <Modal
      aria-labelledby="modal-mint-presale-title"
      aria-describedby="modal-mint-presale-description"
      open={open}
      onClose={onCloseWithReason}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
    >
      <Fade in={open}>
        <Box
          sx={{
            position: "absolute" as "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "80%",
            maxWidth: "600px",
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Card>
            <CardHeader
              id="modal-mint-presale-title"
              action={
                <IconButton aria-label="refresh" onClick={refresh}>
                  <RefreshIcon />
                </IconButton>
              }
              title={t("mint_modal_presale_title", { ns: "mint" })}
              subheader={subheader}
            />
            <CardContent>
              <Box
                id="modal-mint-presale-description"
                minHeight={200}
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignContent="center"
              >
                {step === MintPreSaleModalStep.AUTHENTICATE && (
                  <Box>
                    <Typography sx={{ mt: 2 }}>
                      {t("mint_modal_presale_AUTHENTICATE_description", {
                        ns: "mint",
                      })}
                    </Typography>
                    <Box mt={2}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={signIn}
                      >
                        {t("auth_button_login", {
                          ns: "common",
                        })}
                      </Button>
                    </Box>
                  </Box>
                )}
                {step === MintPreSaleModalStep.IS_ACTIVE && (
                  <>
                    {isPresaleActiveFetched && !isPreSaleActive && (
                      <Typography sx={{ mt: 2 }}>
                        {t("mint_modal_presale_IS_ACTIVE_description", {
                          ns: "mint",
                        })}
                      </Typography>
                    )}
                  </>
                )}
                {step === MintPreSaleModalStep.ALLOCATION && (
                  <>
                    {isPresaleActiveFetched &&
                      isPreSaleActive &&
                      isPreSaleMaxMintPerAccountFetched && (
                        <Typography sx={{ mt: 2 }}>
                          {t("mint_modal_presale_ALLOCATION_description_1", {
                            ns: "mint",
                            maxMintPerAccount: preSaleMaxMintPerAccount,
                            count: preSaleMaxMintPerAccount || 0,
                          })}
                        </Typography>
                      )}
                    {isPresaleActiveFetched &&
                      isPreSaleActive &&
                      isAvailableMintsFetched && (
                        <Typography sx={{ mt: 2 }}>
                          {t("mint_modal_presale_ALLOCATION_description_2", {
                            ns: "mint",
                            address: formatAddressShort(address),
                            tokens: availableMints,
                            count: availableMints || 0,
                          })}
                        </Typography>
                      )}
                    {isPresaleActiveFetched &&
                      isPreSaleActive &&
                      isAvailableMintsFetched && (
                        <>
                          <Typography mt={8}>
                            {t("mint_amount_label", {
                              ns: "mint",
                              amount,
                              count: amount,
                            })}
                          </Typography>
                          <Slider
                            aria-label={t("mint_amount_label", {
                              ns: "mint",
                            })}
                            value={amount}
                            getAriaValueText={(value) => value.toString()}
                            onChange={(_, value) => setAmount(value as number)}
                            step={1}
                            max={availableMints || 0}
                            min={availableMints ? 1 : 0}
                            valueLabelDisplay="auto"
                            marks={[]}
                          />
                        </>
                      )}
                  </>
                )}

                {step === MintPreSaleModalStep.SIGNATURE && (
                  <>
                    <MintPreSaleSubmitContent
                      address={address}
                      count={amount}
                      error={signatureQuery.error}
                      isFetching={signatureQuery.isFetching}
                      isError={signatureQuery.isError}
                      isSuccess={signatureQuery.isSuccess}
                      isLoading={signatureQuery.isLoading}
                    />
                  </>
                )}

                {step === MintPreSaleModalStep.SUBMIT && (
                  <>
                    <Typography sx={{ my: 2, mx: 8 }} textAlign="center">
                      {t("mint_modal_presale_SUBMIT_description", {
                        ns: "mint",
                      })}
                    </Typography>
                    <Box display="flex" justifyContent="center">
                      <CircularProgress variant="indeterminate" />
                    </Box>
                  </>
                )}
                {step === MintPreSaleModalStep.TRANSACTION && (
                  <>
                    <Typography sx={{ my: 2, mx: 8 }} textAlign="center">
                      {t("mint_modal_presale_TRANSACTION_description", {
                        ns: "mint",
                      })}
                    </Typography>
                    <Box display="flex" justifyContent="center">
                      <CircularProgress variant="indeterminate" />
                    </Box>
                    {txHash && (
                      <Box sx={{ my: 2, mx: 8 }} textAlign="center">
                        <a
                          target="_blank"
                          rel="noopener noreferrer"
                          href={`${process.env.NEXT_PUBLIC_BLOCK_EXPLORER}/tx/${txHash}`}
                        >{`TX: ${formatAddressShort(txHash, 12)}`}</a>
                      </Box>
                    )}
                  </>
                )}
                {step === MintPreSaleModalStep.SUCCESS && (
                  <>
                    <Typography sx={{ my: 2, mx: 8 }} textAlign="center">
                      {t("mint_modal_presale_SUCCESS_description", {
                        ns: "mint",
                      })}
                    </Typography>
                    {txHash && (
                      <Box sx={{ my: 2, mx: 8 }} textAlign="center">
                        <a
                          target="_blank"
                          rel="noopener noreferrer"
                          href={`${process.env.NEXT_PUBLIC_BLOCK_EXPLORER}/tx/${txHash}`}
                        >{`TX: ${formatAddressShort(txHash, 12)}`}</a>
                      </Box>
                    )}
                  </>
                )}
                {step === MintPreSaleModalStep.REJECTED && (
                  <Typography sx={{ my: 2 }} textAlign="center">
                    {t("mint_modal_presale_REJECTED_description", {
                      ns: "mint",
                    })}
                  </Typography>
                )}
                {step === MintPreSaleModalStep.FAILED && (
                  <Typography sx={{ my: 2 }} textAlign="center">
                    {t("mint_modal_presale_FAILED_description", {
                      ns: "mint",
                    })}
                  </Typography>
                )}
              </Box>

              <Box minHeight={10}>
                {(isPreSaleMaxMintPerAccountFetching ||
                  isAvailableMintsFetching ||
                  isPresaleActiveFetching) && (
                  <LinearProgress variant="indeterminate" />
                )}
              </Box>
              <CardActions>
                {step === MintPreSaleModalStep.IS_ACTIVE && (
                  <Button
                    color="secondary"
                    variant="contained"
                    onClick={onCloseWithReason}
                  >
                    cancel
                  </Button>
                )}
                {step === MintPreSaleModalStep.ALLOCATION && (
                  <Button
                    color="primary"
                    variant="contained"
                    onClick={enterSignatureStep}
                  >
                    Mint
                  </Button>
                )}
                {step === MintPreSaleModalStep.SUCCESS && (
                  <Button
                    color="primary"
                    variant="contained"
                    onClick={onCloseWithReason}
                  >
                    close
                  </Button>
                )}
                {step === MintPreSaleModalStep.REJECTED && (
                  <>
                    <Button
                      color="secondary"
                      variant="contained"
                      onClick={refresh}
                    >
                      edit
                    </Button>
                    <Button
                      color="primary"
                      variant="contained"
                      onClick={resubmit}
                    >
                      resubmit
                    </Button>
                  </>
                )}
              </CardActions>
            </CardContent>
          </Card>
        </Box>
      </Fade>
    </Modal>
  );
};
