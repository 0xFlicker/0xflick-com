import { createSlice, createSelector, PayloadAction } from "@reduxjs/toolkit";

// Quick-n-dirty, only support one resolver and the standard ENS app fields
export interface IState {
  open: boolean;
  domain?: string;
  addressEth?: string;
  addressBtc?: string;
  addressLtc?: string;
  addressDoge?: string;
  contentHash?: string;
  textRecordEmail?: string;
  textRecordUrl?: string;
  textRecordTwitter?: string;
  textRecordGithub?: string;
  textRecordDescription?: string;
  textRecordAvatar?: string;
  textRecordDiscord?: string;
  textRecordTelegram?: string;
  textRecordKeywords?: string;
}

const initialState: IState = {
  open: false,
};

export const slice = createSlice({
  name: "resolver",
  initialState,
  reducers: {
    open: (state) => {
      state.open = true;
    },
    close: (state) => {
      state.open = false;
    },
    setDomain: (state, action: PayloadAction<string>) => {
      state.domain = action.payload;
    },
    setAddressEth: (state, action: PayloadAction<string>) => {
      state.addressEth = action.payload;
    },
    setAddressBtc: (state, action: PayloadAction<string>) => {
      state.addressBtc = action.payload;
    },
    setAddressLtc: (state, action: PayloadAction<string>) => {
      state.addressLtc = action.payload;
    },
    setAddressDoge: (state, action: PayloadAction<string>) => {
      state.addressDoge = action.payload;
    },
    setContentHash: (state, action: PayloadAction<string>) => {
      state.contentHash = action.payload;
    },
    setTextRecordEmail: (state, action: PayloadAction<string>) => {
      state.textRecordEmail = action.payload;
    },
    setTextRecordUrl: (state, action: PayloadAction<string>) => {
      state.textRecordUrl = action.payload;
    },
    setTextRecordTwitter: (state, action: PayloadAction<string>) => {
      state.textRecordTwitter = action.payload;
    },
    setTextRecordGithub: (state, action: PayloadAction<string>) => {
      state.textRecordGithub = action.payload;
    },
    setTextRecordDescription: (state, action: PayloadAction<string>) => {
      state.textRecordDescription = action.payload;
    },
    setTextRecordAvatar: (state, action: PayloadAction<string>) => {
      state.textRecordAvatar = action.payload;
    },
    setTextRecordDiscord: (state, action: PayloadAction<string>) => {
      state.textRecordDiscord = action.payload;
    },
    setTextRecordTelegram: (state, action: PayloadAction<string>) => {
      state.textRecordTelegram = action.payload;
    },
    setTextRecordKeywords: (state, action: PayloadAction<string>) => {
      state.textRecordKeywords = action.payload;
    },
  },
});

const selectRoot = (state: { resolver: IState }) => state.resolver;
const selectOpen = createSelector(selectRoot, (state) => state.open);
const selectDomain = createSelector(selectRoot, (state) => state.domain);
const selectAddressEth = createSelector(
  selectRoot,
  (state) => state.addressEth
);
const selectAddressBtc = createSelector(
  selectRoot,
  (state) => state.addressBtc
);
const selectAddressLtc = createSelector(
  selectRoot,
  (state) => state.addressLtc
);
const selectAddressDoge = createSelector(
  selectRoot,
  (state) => state.addressDoge
);
const selectContentHash = createSelector(
  selectRoot,
  (state) => state.contentHash
);
const selectTextRecordEmail = createSelector(
  selectRoot,
  (state) => state.textRecordEmail
);
const selectTextRecordUrl = createSelector(
  selectRoot,
  (state) => state.textRecordUrl
);
const selectTextRecordTwitter = createSelector(
  selectRoot,
  (state) => state.textRecordTwitter
);
const selectTextRecordGithub = createSelector(
  selectRoot,
  (state) => state.textRecordGithub
);
const selectTextRecordDescription = createSelector(
  selectRoot,
  (state) => state.textRecordDescription
);
const selectTextRecordAvatar = createSelector(
  selectRoot,
  (state) => state.textRecordAvatar
);
const selectTextRecordDiscord = createSelector(
  selectRoot,
  (state) => state.textRecordDiscord
);
const selectTextRecordTelegram = createSelector(
  selectRoot,
  (state) => state.textRecordTelegram
);
const selectTextRecordKeywords = createSelector(
  selectRoot,
  (state) => state.textRecordKeywords
);

export const actions = slice.actions;
export const reducer = slice.reducer;
export const selectors = {
  open: selectOpen,
  domain: selectDomain,
  addressEth: selectAddressEth,
  addressBtc: selectAddressBtc,
  addressLtc: selectAddressLtc,
  addressDoge: selectAddressDoge,
  contentHash: selectContentHash,
  textRecordEmail: selectTextRecordEmail,
  textRecordUrl: selectTextRecordUrl,
  textRecordTwitter: selectTextRecordTwitter,
  textRecordGithub: selectTextRecordGithub,
  textRecordDescription: selectTextRecordDescription,
  textRecordAvatar: selectTextRecordAvatar,
  textRecordDiscord: selectTextRecordDiscord,
  textRecordTelegram: selectTextRecordTelegram,
  textRecordKeywords: selectTextRecordKeywords,
};
