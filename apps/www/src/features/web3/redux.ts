import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { utils } from "ethers";

export enum WalletType {
  NONE = "NONE",
  METAMASK = "METAMASK",
  WALLET_CONNECT = "WALLET_CONNECT",
}

export enum WalletStatus {
  UNKNOWN = "UNKNOWN",
  IDLE = "IDLE",
  INIT = "INIT",
  CONNECTED = "CONNECTED",
  SIGNED_IN = "SIGNED_IN",
  DISCONNECTED = "DISCONNECTED",
  WRONG_NETWORK = "WRONG_NETWORK",
  SWITCH_CHAIN = "SWITCH_CHAIN",
  ERROR = "ERROR",
}

export interface IState {
  walletType: WalletType;
  status: WalletStatus;
  isWalletSelectModalOpen: boolean;
  accounts: string[];
  error?: {
    message: string;
    name: string;
    stack?: string;
  };
}

const initialState: IState = {
  walletType: WalletType.NONE,
  status: WalletStatus.UNKNOWN,
  isWalletSelectModalOpen: false,
  accounts: [],
};

const slice = createSlice({
  name: "web3",
  initialState,
  reducers: {
    reset(state) {
      state.walletType = WalletType.NONE;
      state.status = WalletStatus.UNKNOWN;
      state.isWalletSelectModalOpen = false;
      state.error = undefined;
      state.accounts = [];
    },
    openWalletSelectModal(state) {
      state.isWalletSelectModalOpen = true;
    },
    closeWalletSelectModal(state) {
      state.isWalletSelectModalOpen = false;
    },
    connectMetamask(state) {
      state.walletType = WalletType.METAMASK;
      state.status = WalletStatus.INIT;
    },
    connectWalletConnect(state) {
      state.walletType = WalletType.WALLET_CONNECT;
      state.status = WalletStatus.INIT;
    },
    idle(state) {
      state.status = WalletStatus.IDLE;
    },
    init(state) {
      state.status = WalletStatus.INIT;
    },
    connected(state) {
      state.status = WalletStatus.CONNECTED;
    },
    signedIn(state) {
      state.status = WalletStatus.SIGNED_IN;
    },
    disconnected(state) {
      state.status = WalletStatus.DISCONNECTED;
    },
    wrongNetwork(state) {
      state.status = WalletStatus.WRONG_NETWORK;
    },
    switchChain(state) {
      state.status = WalletStatus.SWITCH_CHAIN;
    },
    error(
      state: IState,
      action: PayloadAction<{
        message: string;
        name: string;
        stack?: string;
      }>
    ) {
      state.status = WalletStatus.ERROR;
      state.error = {
        message: action.payload.message,
        name: action.payload.name,
        stack: action.payload.stack,
      };
    },
    setAccounts(state, action: PayloadAction<string[]>) {
      state.accounts = action.payload.map(utils.getAddress);
    },
  },
});

const selectRoot = (state: { web3: IState }) => state.web3;
const selectIsWalletSelectModalOpen = createSelector(
  selectRoot,
  (state) => state.isWalletSelectModalOpen
);
const selectWalletType = createSelector(
  selectRoot,
  (state) => state.walletType
);
const selectWalletStatus = createSelector(selectRoot, (state) => state.status);
const selectIsWrongNetwork = createSelector(
  selectWalletStatus,
  (state) => state === WalletStatus.WRONG_NETWORK
);
const selectIsConnected = createSelector(
  selectWalletStatus,
  (state) => state === WalletStatus.CONNECTED
);
const selectAddress = createSelector(
  selectRoot,
  (state) =>
    state.accounts &&
    (state.accounts.length > 0 ? state.accounts[0] : undefined)
);

export const selectors = {
  isWalletSelectModalOpen: selectIsWalletSelectModalOpen,
  isWrongNetwork: selectIsWrongNetwork,
  isConnected: selectIsConnected,
  type: selectWalletType,
  status: selectWalletStatus,
  address: selectAddress,
};

export const { actions, reducer } = slice;
