import { createSelector, createSlice } from "@reduxjs/toolkit";

interface IState {
  chainId: number;
  chainName: string;
  authTimeout: number;
  blockExplorerUrl: string;
  nftContractAddress: string;
  nftEnumeratorContractAddress: string;
  appName: string;
}
const oneWeekMs = 60 * 60 * 24 * 7 * 1000;
const initialState: IState = {
  chainId: Number(process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID) || 1,
  chainName: process.env.NEXT_PUBLIC_DEFAULT_CHAIN_NAME ?? "",
  authTimeout: Number(process.env.WEB3_AUTH_TIMEOUT) || oneWeekMs,
  blockExplorerUrl: process.env.NEXT_PUBLIC_BLOCK_EXPLORER ?? "",
  nftContractAddress: process.env.NFT_CONTRACT_ADDRESS ?? "",
  nftEnumeratorContractAddress:
    process.env.NFT_ENUMERATOR_CONTRACT_ADDRESS ?? "",
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? "",
};
const slice = createSlice({
  name: "config",
  initialState,
  reducers: {},
});

const root = (state: any): IState => state.config;
const selectChainId = createSelector(root, (state) => state.chainId);
const selectChainName = createSelector(root, (state) => state.chainName);
const selectAuthTimeout = createSelector(root, (state) => state.authTimeout);
const selectBlockExplorerUrl = createSelector(
  root,
  (state) => state.blockExplorerUrl
);
const selectNftContractAddress = createSelector(
  root,
  (state) => state.nftContractAddress
);
const selectNftEnumeratorContractAddress = createSelector(
  root,
  (state) => state.nftEnumeratorContractAddress
);
const selectAppName = createSelector(root, (state) => state.appName);
export const selectors = {
  chainId: selectChainId,
  chainName: selectChainName,
  authTimeout: selectAuthTimeout,
  blockExplorerUrl: selectBlockExplorerUrl,
  nftContractAddress: selectNftContractAddress,
  nftEnumeratorContractAddress: selectNftEnumeratorContractAddress,
  appName: selectAppName,
};
export const { reducer } = slice;
