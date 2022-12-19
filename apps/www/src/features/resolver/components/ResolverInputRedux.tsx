import { ChangeEventHandler, FC, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@0xflick/app-store";
import {
  Box,
  Input,
  InputLabel,
  InputAdornment,
  FormControl,
  TextField,
} from "@mui/material";
import {
  selectors as resolverSelectors,
  actions as actionSelectors,
} from "../redux";
import { Diamond } from "@mui/icons-material";

/*
 * FIXME: stop using redux
 */

export const ResolverInput: FC = () => {
  const dispatch = useAppDispatch();
  const domain = useAppSelector(resolverSelectors.domain);
  const handleDomainChange: ChangeEventHandler<
    HTMLInputElement | HTMLTextAreaElement
  > = useCallback(
    (event) => {
      dispatch(actionSelectors.setDomain(event.target.value));
    },
    [dispatch]
  );

  const addressEth = useAppSelector(resolverSelectors.addressEth);
  const handleAddressEthChange: ChangeEventHandler<
    HTMLInputElement | HTMLTextAreaElement
  > = useCallback(
    (event) => {
      dispatch(actionSelectors.setAddressEth(event.target.value));
    },
    [dispatch]
  );

  const addressBtc = useAppSelector(resolverSelectors.addressBtc);
  const handleAddressBtcChange: ChangeEventHandler<
    HTMLInputElement | HTMLTextAreaElement
  > = useCallback(
    (event) => {
      dispatch(actionSelectors.setAddressBtc(event.target.value));
    },
    [dispatch]
  );

  const addressLtc = useAppSelector(resolverSelectors.addressLtc);
  const handleAddressLtcChange: ChangeEventHandler<
    HTMLInputElement | HTMLTextAreaElement
  > = useCallback(
    (event) => {
      dispatch(actionSelectors.setAddressLtc(event.target.value));
    },
    [dispatch]
  );

  const addressDoge = useAppSelector(resolverSelectors.addressDoge);
  const handleAddressDogeChange: ChangeEventHandler<
    HTMLInputElement | HTMLTextAreaElement
  > = useCallback(
    (event) => {
      dispatch(actionSelectors.setAddressDoge(event.target.value));
    },
    [dispatch]
  );

  const contentHash = useAppSelector(resolverSelectors.contentHash);
  const handleContentHashChange: ChangeEventHandler<
    HTMLInputElement | HTMLTextAreaElement
  > = useCallback(
    (event) => {
      dispatch(actionSelectors.setContentHash(event.target.value));
    },
    [dispatch]
  );

  const textEmail = useAppSelector(resolverSelectors.textRecordEmail);
  const handleTextEmailChange: ChangeEventHandler<
    HTMLInputElement | HTMLTextAreaElement
  > = useCallback(
    (event) => {
      dispatch(actionSelectors.setTextRecordEmail(event.target.value));
    },
    [dispatch]
  );

  const textUrl = useAppSelector(resolverSelectors.textRecordUrl);
  const handleTextUrlChange: ChangeEventHandler<
    HTMLInputElement | HTMLTextAreaElement
  > = useCallback(
    (event) => {
      dispatch(actionSelectors.setTextRecordUrl(event.target.value));
    },
    [dispatch]
  );

  const textTwitter = useAppSelector(resolverSelectors.textRecordTwitter);
  const handleTextTwitterChange: ChangeEventHandler<
    HTMLInputElement | HTMLTextAreaElement
  > = useCallback(
    (event) => {
      dispatch(actionSelectors.setTextRecordTwitter(event.target.value));
    },
    [dispatch]
  );

  const textGithub = useAppSelector(resolverSelectors.textRecordGithub);
  const handleTextGithubChange: ChangeEventHandler<
    HTMLInputElement | HTMLTextAreaElement
  > = useCallback(
    (event) => {
      dispatch(actionSelectors.setTextRecordGithub(event.target.value));
    },
    [dispatch]
  );

  const textDescription = useAppSelector(
    resolverSelectors.textRecordDescription
  );
  const handleTextDescriptionChange: ChangeEventHandler<
    HTMLInputElement | HTMLTextAreaElement
  > = useCallback(
    (event) => {
      dispatch(actionSelectors.setTextRecordDescription(event.target.value));
    },
    [dispatch]
  );

  const textAvatar = useAppSelector(resolverSelectors.textRecordAvatar);
  const handleTextAvatarChange: ChangeEventHandler<
    HTMLInputElement | HTMLTextAreaElement
  > = useCallback(
    (event) => {
      dispatch(actionSelectors.setTextRecordAvatar(event.target.value));
    },
    [dispatch]
  );

  const textDiscord = useAppSelector(resolverSelectors.textRecordDiscord);
  const handleTextDiscordChange: ChangeEventHandler<
    HTMLInputElement | HTMLTextAreaElement
  > = useCallback(
    (event) => {
      dispatch(actionSelectors.setTextRecordDiscord(event.target.value));
    },
    [dispatch]
  );

  const textTelegram = useAppSelector(resolverSelectors.textRecordTelegram);
  const handleTextTelegramChange: ChangeEventHandler<
    HTMLInputElement | HTMLTextAreaElement
  > = useCallback(
    (event) => {
      dispatch(actionSelectors.setTextRecordTelegram(event.target.value));
    },
    [dispatch]
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
      }}
    >
      <FormControl sx={{ m: 1, width: "100%" }}>
        <InputLabel htmlFor="resolver-input">Resolver</InputLabel>
        <Input
          id="resolver-domain-input"
          defaultValue={domain}
          onChange={handleDomainChange}
          startAdornment={
            <InputAdornment position="start">
              <Diamond />
            </InputAdornment>
          }
        />
      </FormControl>
      <FormControl sx={{ m: 1, width: "100%" }}>
        <InputLabel htmlFor="resolver-address-eth-input">Resolver</InputLabel>
        <Input
          id="resolver-address-eth-input"
          defaultValue={addressEth}
          onChange={handleAddressEthChange}
          startAdornment={
            <InputAdornment position="start">https://</InputAdornment>
          }
        />
      </FormControl>
      <FormControl sx={{ m: 1, width: "100%" }}>
        <InputLabel htmlFor="resolver-text-record-email-input">
          Resolver
        </InputLabel>
        <Input
          id="resolver-text-record-email-input"
          defaultValue={textEmail}
          onChange={handleTextEmailChange}
          startAdornment={
            <InputAdornment position="start">https://</InputAdornment>
          }
        />
      </FormControl>
    </Box>
  );
};
