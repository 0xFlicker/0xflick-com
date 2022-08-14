import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  readContractRedux,
  createReadInputRedux,
  defaultReadContractState,
  IReadState,
} from "contracts/helpers/redux";

export enum MintPreSaleModalStep {
  UNKNOWN = "UNKNOWN",
  AUTHENTICATE = "AUTHENTICATE",
  IS_ACTIVE = "IS_ACTIVE",
  ALLOCATION = "ALLOCATION",
  SIGNATURE = "SIGNATURE",
  SUBMIT = "SUBMIT",
  TRANSACTION = "TRANSACTION",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
  REJECTED = "REJECTED",
}

export const totalSupplySlice = readContractRedux<number>("totalSupply");
export const presaleActiveSlice = readContractRedux<boolean>("presaleActive");
export const preSaleMaxMintSlice = readContractRedux<number>(
  "preSaleMaxMintPerAccount"
);
export const publicSaleSlice = readContractRedux<boolean>("publicSaleActive");
export const pausedSlice = readContractRedux<boolean>("paused");
export const nameSlice = readContractRedux<string>("name");
export const maxSupplySlice = readContractRedux<number>("maxSupply");
export const maxMintSlice = readContractRedux<number>("maxMint");
export const costSlice = readContractRedux<number>("cost");
export const preSaleMinted = createReadInputRedux<
  number,
  {
    address: string;
  }
>("preSaleMintAvailable", ({ address }) => address);
export const balanceOfSlice = createReadInputRedux<
  number,
  {
    address: string;
  }
>("balance", ({ address }) => address);
export const alreadyMintedSlice = createReadInputRedux<
  boolean,
  {
    address: string;
    nonce: number;
  }
>("alreadyMinted", ({ address, nonce }) => `${address}:${nonce}`);

export interface IState {
  preSaleStep: MintPreSaleModalStep;
  activeFetchingCount: number;
  name: IReadState<string>;
  cost: IReadState<number>;
  maxSupply: IReadState<number>;
  totalSupply: IReadState<number>;
  isPresaleActive: IReadState<boolean>;
  preSaleMaxMintPerAccount: IReadState<number>;
  isPublicSaleActive: IReadState<boolean>;
  isPaused: IReadState<boolean>;
  balanceOf: Record<string, IReadState<number, { address: string }>>;
  preSaleMinted: Record<string, IReadState<number, { address: string }>>;
  alreadyMinted: Record<
    string,
    IReadState<boolean, { address: string; nonce: number }>
  >;
}
const initialState: IState = {
  preSaleStep: MintPreSaleModalStep.UNKNOWN,
  activeFetchingCount: 0,
  name: defaultReadContractState(),
  cost: defaultReadContractState(),
  maxSupply: defaultReadContractState(),
  totalSupply: defaultReadContractState(),
  isPresaleActive: defaultReadContractState(),
  preSaleMaxMintPerAccount: defaultReadContractState(),
  isPublicSaleActive: defaultReadContractState(),
  isPaused: defaultReadContractState(),
  balanceOf: {},
  preSaleMinted: {},
  alreadyMinted: {},
};

function incActiveFetchingCount(state: IState) {
  state.activeFetchingCount += 1;
}
function decActiveFetchingCount(state: IState) {
  state.activeFetchingCount =
    state.activeFetchingCount > 0 ? state.activeFetchingCount - 1 : 0;
}
const slice = createSlice({
  name: "mint",
  initialState,
  reducers: {
    preSaleStep(state, action: PayloadAction<MintPreSaleModalStep>) {
      state.preSaleStep = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(nameSlice.actions.fetch, incActiveFetchingCount)
      .addCase(nameSlice.actions.fetchSuccess, decActiveFetchingCount)
      .addCase(nameSlice.actions.fetchError, decActiveFetchingCount)
      .addCase(costSlice.actions.fetch, incActiveFetchingCount)
      .addCase(costSlice.actions.fetchSuccess, decActiveFetchingCount)
      .addCase(costSlice.actions.fetchError, decActiveFetchingCount)
      .addCase(maxSupplySlice.actions.fetch, incActiveFetchingCount)
      .addCase(maxSupplySlice.actions.fetchSuccess, decActiveFetchingCount)
      .addCase(maxSupplySlice.actions.fetchError, decActiveFetchingCount)
      .addCase(totalSupplySlice.actions.fetch, incActiveFetchingCount)
      .addCase(totalSupplySlice.actions.fetchSuccess, decActiveFetchingCount)
      .addCase(totalSupplySlice.actions.fetchError, decActiveFetchingCount)
      .addCase(presaleActiveSlice.actions.fetch, incActiveFetchingCount)
      .addCase(presaleActiveSlice.actions.fetchSuccess, decActiveFetchingCount)
      .addCase(presaleActiveSlice.actions.fetchError, decActiveFetchingCount)
      .addCase(preSaleMaxMintSlice.actions.fetch, incActiveFetchingCount)
      .addCase(preSaleMaxMintSlice.actions.fetchSuccess, decActiveFetchingCount)
      .addCase(preSaleMaxMintSlice.actions.fetchError, decActiveFetchingCount)
      .addCase(publicSaleSlice.actions.fetch, incActiveFetchingCount)
      .addCase(publicSaleSlice.actions.fetchSuccess, decActiveFetchingCount)
      .addCase(publicSaleSlice.actions.fetchError, decActiveFetchingCount)
      .addCase(pausedSlice.actions.fetch, incActiveFetchingCount)
      .addCase(pausedSlice.actions.fetchSuccess, decActiveFetchingCount)
      .addCase(pausedSlice.actions.fetchError, decActiveFetchingCount)
      .addCase(balanceOfSlice.actions.fetch, incActiveFetchingCount)
      .addCase(balanceOfSlice.actions.fetchSuccess, decActiveFetchingCount)
      .addCase(balanceOfSlice.actions.fetchError, decActiveFetchingCount)
      .addCase(preSaleMinted.actions.fetch, incActiveFetchingCount)
      .addCase(preSaleMinted.actions.fetchSuccess, decActiveFetchingCount)
      .addCase(preSaleMinted.actions.fetchError, decActiveFetchingCount)
      .addCase(alreadyMintedSlice.actions.fetch, incActiveFetchingCount)
      .addCase(alreadyMintedSlice.actions.fetchSuccess, decActiveFetchingCount)
      .addCase(alreadyMintedSlice.actions.fetchError, decActiveFetchingCount);
  },
});

function selectRoot(state: { mint: IState }) {
  return state.mint;
}
const selectName = createSelector(selectRoot, (state) => state.name);
const selectCost = createSelector(selectRoot, (state) => state.cost);
const selectMaxSupply = createSelector(selectRoot, (state) => state.maxSupply);
const selectTotalSupply = createSelector(
  selectRoot,
  (state) => state.totalSupply
);
const selectIsPresaleActive = createSelector(
  selectRoot,
  (state) => state.isPresaleActive
);
const selectIsPreSaleMaxMintPerAccount = createSelector(
  selectRoot,
  (state) => state.preSaleMaxMintPerAccount
);
const selectIsPublicSaleActive = createSelector(
  selectRoot,
  (state) => state.isPublicSaleActive
);
const selectIsPaused = createSelector(selectRoot, (state) => state.isPaused);
const selectBalanceOf = (address?: string) =>
  createSelector(
    selectRoot,
    (state) =>
      (address && state.balanceOf[address]) || {
        fetching: false,
        error: null,
      }
  );
const selectAlreadyMinted = (address?: string, nonce?: number) =>
  createSelector(
    selectRoot,
    (state) =>
      (address &&
        typeof nonce === "number" &&
        state.alreadyMinted[`${address}:${nonce}`]) || {
        fetching: false,
        error: null,
      }
  );

const selectPresaleAlreadyMinted = (address?: string) =>
  createSelector(
    selectRoot,
    (state) =>
      (address && state.preSaleMinted[address]) || {
        fetching: false,
        error: null,
      }
  );

const isFetching = ({ fetching }: IReadState<unknown, unknown>) => fetching;
const hasFetched = ({ value }: IReadState<unknown, unknown>) =>
  typeof value !== "undefined";
const selectValue = <T>({ value }: IReadState<T, unknown>) => value;
const selectError = ({ error }: IReadState<unknown, unknown>) => error;
const selectPreSaleStep = createSelector(
  selectRoot,
  (state) => state.preSaleStep
);
const selectors = {
  preSaleStep: selectPreSaleStep,
  isPreSaleStepActiveGate: createSelector(
    selectPreSaleStep,
    (state) => state === MintPreSaleModalStep.IS_ACTIVE
  ),
  isPreSaleStepAllocation: createSelector(
    selectPreSaleStep,
    (state) => state === MintPreSaleModalStep.ALLOCATION
  ),
  isPreSaleStepSignature: createSelector(
    selectPreSaleStep,
    (state) => state === MintPreSaleModalStep.SIGNATURE
  ),
  isPreSaleStepSubmit: createSelector(
    selectPreSaleStep,
    (state) => state === MintPreSaleModalStep.SUBMIT
  ),
  isPreSaleStepTransaction: createSelector(
    selectPreSaleStep,
    (state) => state === MintPreSaleModalStep.TRANSACTION
  ),
  isPreSaleStepSuccess: createSelector(
    selectPreSaleStep,
    (state) => state === MintPreSaleModalStep.SUCCESS
  ),
  isPreSaleStepFailed: createSelector(
    selectPreSaleStep,
    (state) => state === MintPreSaleModalStep.FAILED
  ),
  isPreSaleStepRejected: createSelector(
    selectPreSaleStep,
    (state) => state === MintPreSaleModalStep.REJECTED
  ),
  isNameFetching: createSelector(selectName, isFetching),
  isNameFetched: createSelector(selectName, hasFetched),
  name: createSelector(selectName, (s: IReadState<string>) => selectValue(s)),
  nameError: createSelector(selectName, selectError),
  isCostFetching: createSelector(selectCost, isFetching),
  isCostFetched: createSelector(selectCost, hasFetched),
  cost: createSelector(selectCost, (s: IReadState<number>) => selectValue(s)),
  costError: createSelector(selectCost, selectError),
  isMaxSupplyFetching: createSelector(selectMaxSupply, isFetching),
  isMaxSupplyFetched: createSelector(selectMaxSupply, hasFetched),
  maxSupply: createSelector(selectMaxSupply, (s: IReadState<number>) =>
    selectValue(s)
  ),
  maxSupplyError: createSelector(selectMaxSupply, selectError),
  isTotalSupplyFetching: createSelector(selectTotalSupply, isFetching),
  isTotalSupplyFetched: createSelector(selectTotalSupply, hasFetched),
  totalSupply: createSelector(selectTotalSupply, (s: IReadState<number>) =>
    selectValue(s)
  ),
  totalSupplyError: createSelector(selectTotalSupply, selectError),
  isPresaleActiveFetching: createSelector(selectIsPresaleActive, isFetching),
  isPresaleActiveFetched: createSelector(selectIsPresaleActive, hasFetched),
  presaleActive: createSelector(
    selectIsPresaleActive,
    (s: IReadState<boolean>) => selectValue(s)
  ),
  presaleActiveError: createSelector(selectIsPresaleActive, selectError),
  isPreSaleMaxMintPerAccountFetching: createSelector(
    selectIsPreSaleMaxMintPerAccount,
    isFetching
  ),
  isPreSaleMaxMintPerAccountFetched: createSelector(
    selectIsPreSaleMaxMintPerAccount,
    hasFetched
  ),
  preSaleMaxMintPerAccount: createSelector(
    selectIsPreSaleMaxMintPerAccount,
    (s: IReadState<number>) => selectValue(s)
  ),
  preSaleMaxMintPerAccountError: createSelector(
    selectIsPreSaleMaxMintPerAccount,
    selectError
  ),
  isPublicSaleActiveFetching: createSelector(
    selectIsPublicSaleActive,
    isFetching
  ),
  isPublicSaleActiveFetched: createSelector(
    selectIsPublicSaleActive,
    hasFetched
  ),
  isPublicSaleActive: createSelector(
    selectIsPublicSaleActive,
    (s: IReadState<boolean>) => selectValue(s)
  ),
  isPausedFetching: createSelector(selectIsPublicSaleActive, isFetching),
  isPausedFetched: createSelector(selectIsPublicSaleActive, hasFetched),
  isPaused: createSelector(selectIsPaused, (s: IReadState<boolean>) =>
    selectValue(s)
  ),
  isPausedError: createSelector(selectIsPaused, selectError),
  balanceOf: (address?: string) =>
    createSelector(
      selectRoot,
      (state) =>
        address &&
        balanceOfSlice.selectorFactory({ address }).value(state.balanceOf)
    ),
  balanceOfError: (address?: string) =>
    createSelector(
      selectRoot,
      (state) =>
        address &&
        balanceOfSlice.selectorFactory({ address }).error(state.balanceOf)
    ),
  isBalanceOfFetching: (address?: string) =>
    createSelector(selectBalanceOf(address), isFetching),
  isBalanceOfFetched: (address?: string) =>
    createSelector(selectBalanceOf(address), hasFetched),
  preSaleMinted: (address?: string) =>
    createSelector(
      selectRoot,
      (state) =>
        address &&
        preSaleMinted.selectorFactory({ address }).value(state.preSaleMinted)
    ),
  preSaleMintedError: (address?: string) =>
    createSelector(
      selectRoot,
      (state) =>
        address &&
        preSaleMinted.selectorFactory({ address }).error(state.preSaleMinted)
    ),
  isPreSaleMintedFetching: (address?: string) =>
    createSelector(selectPresaleAlreadyMinted(address), isFetching),
  isPreSaleMintedFetched: (address?: string) =>
    createSelector(selectPresaleAlreadyMinted(address), hasFetched),
  alreadyMinted: (address: string, nonce: number) =>
    createSelector(selectRoot, (state) =>
      alreadyMintedSlice
        .selectorFactory({
          address,
          nonce,
        })
        .value(state.alreadyMinted)
    ),
  alreadyMintedError: (address: string, nonce: number) =>
    createSelector(selectRoot, (state) =>
      alreadyMintedSlice
        .selectorFactory({
          address,
          nonce,
        })
        .error(state.alreadyMinted)
    ),
  isAlreadyMintedFetching: (address: string, nonce: number) =>
    createSelector(selectAlreadyMinted(address, nonce), isFetching),
  isAlreadyMintedFetched: (address: string, nonce: number) =>
    createSelector(selectAlreadyMinted(address, nonce), hasFetched),
};

const actions = {
  ...slice.actions,
  name: nameSlice.actions,
  cost: costSlice.actions,
  maxSupply: maxSupplySlice.actions,
  totalSupply: totalSupplySlice.actions,
  isPresaleActive: presaleActiveSlice.actions,
  isPreSaleMaxMintPerAccount: preSaleMaxMintSlice.actions,
  isPublicSaleActive: publicSaleSlice.actions,
  isPaused: pausedSlice.actions,
  balanceOf: balanceOfSlice.actions,
  preSaleMinted: preSaleMinted.actions,
  alreadyMinted: alreadyMintedSlice.actions,
};

const reducer = (state: IState | undefined, action: any): IState => {
  const rState = slice.reducer(state, action);
  return {
    ...rState,
    name: nameSlice.reducer(rState.name, action),
    cost: costSlice.reducer(rState.cost, action),
    maxSupply: maxSupplySlice.reducer(rState.maxSupply, action),
    totalSupply: totalSupplySlice.reducer(rState.totalSupply, action),
    isPresaleActive: presaleActiveSlice.reducer(rState.isPresaleActive, action),
    preSaleMaxMintPerAccount: preSaleMaxMintSlice.reducer(
      rState.preSaleMaxMintPerAccount,
      action
    ),
    isPublicSaleActive: publicSaleSlice.reducer(
      rState.isPublicSaleActive,
      action
    ),
    isPaused: pausedSlice.reducer(rState.isPaused, action),
    balanceOf: balanceOfSlice.reducer(rState.balanceOf, action),
    preSaleMinted: preSaleMinted.reducer(rState.preSaleMinted, action),
    alreadyMinted: alreadyMintedSlice.reducer(rState.alreadyMinted, action),
  };
};
export { actions, reducer, selectors };
