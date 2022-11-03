import { useAppDispatch, useAppSelector, AppDispatch } from "app/store";
import { useERC721 } from "features/nfts/hooks";
import { useCallback, useEffect, useReducer } from "react";
import { selectors as web3Selectors } from "features/web3";
import { actions, selectors } from "./redux";
import { FlickENS } from "@0xflick/contracts";
import { utils } from "ethers";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
export { useRequestPresaleApprovalMutation } from "./graphql/requestApproval.generated";

async function fetchName(dispatch: AppDispatch, contract: FlickENS) {
  try {
    dispatch(actions.name.fetch());
    dispatch(actions.name.fetchSuccess(await contract.name()));
  } catch (error: any) {
    dispatch(actions.name.fetchError(error.message));
  }
}

async function fetchCost(dispatch: AppDispatch, contract: FlickENS) {
  try {
    dispatch(actions.cost.fetch());
    const cost = await contract.cost();
    dispatch(actions.cost.fetchSuccess(cost.toNumber()));
  } catch (error: any) {
    dispatch(actions.cost.fetchError(error.message));
  }
}

async function fetchMaxSupply(dispatch: AppDispatch, contract: FlickENS) {
  try {
    dispatch(actions.maxSupply.fetch());
    const maxSupply = await contract.maxSupply();
    dispatch(actions.maxSupply.fetchSuccess(maxSupply.toNumber()));
  } catch (error: any) {
    dispatch(actions.maxSupply.fetchError(error.message));
  }
}

async function fetchTotalSupply(dispatch: AppDispatch, contract: FlickENS) {
  try {
    dispatch(actions.totalSupply.fetch());
    const totalSupply = await contract.totalSupply();
    dispatch(actions.totalSupply.fetchSuccess(totalSupply.toNumber()));
  } catch (error: any) {
    dispatch(actions.totalSupply.fetchError(error.message));
  }
}

async function fetchPresaleActive(dispatch: AppDispatch, contract: FlickENS) {
  try {
    dispatch(actions.isPresaleActive.fetch());
    const presaleActive = await contract.presaleActive();
    dispatch(actions.isPresaleActive.fetchSuccess(presaleActive));
  } catch (error: any) {
    dispatch(actions.isPresaleActive.fetchError(error.message));
  }
}

async function fetchPreSaleMaxMintPerAccount(
  dispatch: AppDispatch,
  contract: FlickENS
) {
  try {
    dispatch(actions.isPreSaleMaxMintPerAccount.fetch());
    const preSaleMaxMintPerAccount = await contract.preSaleMaxMintPerAccount();
    dispatch(
      actions.isPreSaleMaxMintPerAccount.fetchSuccess(
        preSaleMaxMintPerAccount.toNumber()
      )
    );
  } catch (error: any) {
    dispatch(actions.isPreSaleMaxMintPerAccount.fetchError(error.message));
  }
}

function fetchBalanceOf(dispatch: AppDispatch, contract?: FlickENS) {
  return async (address: string) => {
    if (!contract) {
      return;
    }
    try {
      dispatch(actions.balanceOf.fetch({ address }));
      const balance = await contract.balanceOf(address);
      dispatch(
        actions.balanceOf.fetchSuccess({
          input: { address },
          value: balance.toNumber(),
        })
      );
    } catch (error: any) {
      dispatch(
        actions.balanceOf.fetchError({
          input: { address },
          errorMessage: error.message,
        })
      );
    }
  };
}

function fetchPreSaleMinted(dispatch: AppDispatch, contract?: FlickENS) {
  return async (address: string) => {
    if (!contract) {
      return;
    }
    try {
      dispatch(actions.preSaleMinted.fetch({ address }));
      const mintAvailable = await contract.presaleMintedByAddress(address);
      dispatch(
        actions.preSaleMinted.fetchSuccess({
          input: { address },
          value: mintAvailable,
        })
      );
    } catch (error: any) {
      dispatch(
        actions.preSaleMinted.fetchError({
          input: { address },
          errorMessage: error.message,
        })
      );
    }
  };
}

async function fetchAlreadyMinted(
  dispatch: AppDispatch,
  onSuccess: (alreadyMinted: boolean) => void,
  onFailure: (error: string) => void,
  address: string,
  nonce: number,
  contract?: FlickENS
) {
  if (!contract) {
    return;
  }
  try {
    dispatch(actions.alreadyMinted.fetch({ address, nonce }));
    const alreadyMinted = await contract.alreadyMinted(
      address,
      utils.hexZeroPad(utils.hexlify(nonce), 32)
    );
    dispatch(
      actions.alreadyMinted.fetchSuccess({
        input: { address, nonce },
        value: alreadyMinted,
      })
    );
    onSuccess(alreadyMinted);
  } catch (error: any) {
    dispatch(
      actions.alreadyMinted.fetchError({
        input: { address, nonce },
        errorMessage: error.message,
      })
    );
    onFailure(error.message);
  }
}

export function useMint() {
  const { contract } = useERC721();
  const dispatch = useAppDispatch();
  const web3IsConnected = useAppSelector(web3Selectors.isConnected);

  const isNamedFetched = useAppSelector(selectors.isNameFetched);
  const isCostFetched = useAppSelector(selectors.isCostFetched);
  const isMaxSupplyFetched = useAppSelector(selectors.isMaxSupplyFetched);
  const isTotalSupplyFetched = useAppSelector(selectors.isTotalSupplyFetched);
  const isPresaleActiveFetched = useAppSelector(
    selectors.isPresaleActiveFetched
  );
  const isPreSaleMaxMintPerAccountFetched = useAppSelector(
    selectors.isPreSaleMaxMintPerAccountFetched
  );
  const isPausedFetched = true;

  useEffect(() => {
    if (contract && web3IsConnected && !isNamedFetched) {
      fetchName(dispatch, contract);
    }
  }, [contract, web3IsConnected, dispatch, isNamedFetched]);
  useEffect(() => {
    if (contract && web3IsConnected && !isCostFetched) {
      fetchCost(dispatch, contract);
    }
  }, [contract, web3IsConnected, dispatch, isCostFetched]);
  useEffect(() => {
    if (contract && web3IsConnected && !isMaxSupplyFetched) {
      fetchMaxSupply(dispatch, contract);
    }
  }, [contract, web3IsConnected, dispatch, isMaxSupplyFetched]);
  useEffect(() => {
    if (contract && web3IsConnected && !isTotalSupplyFetched) {
      fetchTotalSupply(dispatch, contract);
    }
  }, [contract, web3IsConnected, dispatch, isTotalSupplyFetched]);
  useEffect(() => {
    if (contract && web3IsConnected && !isPreSaleMaxMintPerAccountFetched) {
      fetchPreSaleMaxMintPerAccount(dispatch, contract);
    }
  }, [contract, web3IsConnected, dispatch, isPreSaleMaxMintPerAccountFetched]);
  useEffect(() => {
    if (contract && web3IsConnected && !isPresaleActiveFetched) {
      fetchPresaleActive(dispatch, contract);
    }
  }, [contract, web3IsConnected, dispatch, isPresaleActiveFetched]);
}

export function usePreSaleActive() {
  const { contract } = useERC721();
  const dispatch = useAppDispatch();
  const web3IsConnected = useAppSelector(web3Selectors.isConnected);
  return {
    refresh: useCallback(
      () =>
        contract && web3IsConnected && fetchPresaleActive(dispatch, contract),
      [contract, dispatch, web3IsConnected]
    ),
    isFetching: useAppSelector(selectors.isPresaleActiveFetching),
    isFetched: useAppSelector(selectors.isPresaleActiveFetched),
    preSaleActive: useAppSelector(selectors.presaleActive),
    error: useAppSelector(selectors.presaleActiveError),
  };
}

export function usePreSaleMaxMintPerAccount() {
  const { contract } = useERC721();
  const dispatch = useAppDispatch();
  const web3IsConnected = useAppSelector(web3Selectors.isConnected);
  return {
    refresh: useCallback(
      () =>
        contract &&
        web3IsConnected &&
        fetchPreSaleMaxMintPerAccount(dispatch, contract),
      [contract, dispatch, web3IsConnected]
    ),
    isFetching: useAppSelector(selectors.isPreSaleMaxMintPerAccountFetching),
    isFetched: useAppSelector(selectors.isPreSaleMaxMintPerAccountFetched),
    preSaleMaxMintPerAccount: useAppSelector(
      selectors.preSaleMaxMintPerAccount
    ),
    error: useAppSelector(selectors.preSaleMaxMintPerAccountError),
  };
}

export function useTotalSupply() {
  const { contract } = useERC721();
  const dispatch = useAppDispatch();
  const web3IsConnected = useAppSelector(web3Selectors.isConnected);
  return {
    refresh: useCallback(
      () => contract && web3IsConnected && fetchTotalSupply(dispatch, contract),
      [contract, dispatch, web3IsConnected]
    ),
    isFetching: useAppSelector(selectors.isTotalSupplyFetching),
    isFetched: useAppSelector(selectors.isTotalSupplyFetched),
    totalSupply: useAppSelector(selectors.totalSupply),
    error: useAppSelector(selectors.totalSupplyError),
  };
}

export function useMaxSupply() {
  const { contract } = useERC721();
  const dispatch = useAppDispatch();
  const web3IsConnected = useAppSelector(web3Selectors.isConnected);
  return {
    refresh: useCallback(
      () => contract && web3IsConnected && fetchMaxSupply(dispatch, contract),
      [contract, dispatch, web3IsConnected]
    ),
    isFetching: useAppSelector(selectors.isMaxSupplyFetching),
    isFetched: useAppSelector(selectors.isMaxSupplyFetched),
    maxSupply: useAppSelector(selectors.maxSupply),
    error: useAppSelector(selectors.maxSupplyError),
  };
}

export function useBalanceOf(address?: string) {
  const { contract } = useERC721();
  const dispatch = useAppDispatch();
  const isBalanceOfFetched = useAppSelector(
    selectors.isBalanceOfFetched(address)
  );
  const action = useCallback(
    (address: string) => fetchBalanceOf(dispatch, contract)(address),
    [dispatch, contract]
  );
  const web3IsConnected = useAppSelector(web3Selectors.isConnected);
  useEffect(() => {
    if (address && web3IsConnected && contract && !isBalanceOfFetched) {
      action(address);
    }
  }, [web3IsConnected, contract, address, isBalanceOfFetched, action]);
  return {
    refetch: action,
    isFetching: useAppSelector(selectors.isBalanceOfFetching(address)),
    isFetched: isBalanceOfFetched,
    balanceOf: useAppSelector(selectors.balanceOf(address)),
    error: useAppSelector(selectors.balanceOfError(address)),
  };
}

const preSaleAvailableMintsSlice = createSlice({
  name: "preSaleAlreadyMinted",
  initialState: {
    fetchCount: 0,
    availableMints: [] as number[],
    hasFetched: false,
    error: null as null | string,
  },
  reducers: {
    reset: (state) => {
      state.fetchCount = 0;
      state.availableMints = [];
      state.hasFetched = false;
      state.error = null;
    },
    fetchCountIncrement: (state) => {
      state.fetchCount += 1;
    },
    fetchCountDecrement: (state) => {
      if (state.fetchCount <= 1) {
        state.fetchCount = 0;
        state.hasFetched = true;
      } else {
        state.fetchCount -= 1;
      }
    },
    setAvailableMint(state, action: PayloadAction<number>) {
      if (state.availableMints.includes(action.payload)) {
        return;
      }
      state.availableMints.push(action.payload);
    },
    error(state, action: PayloadAction<string>) {
      state.error = action.payload;
    },
  },
});
export function usePreSaleMinted(address?: string) {
  const { contract } = useERC721();
  const dispatch = useAppDispatch();
  const isPreSaleMineAvailableFetched = useAppSelector(
    selectors.isPreSaleMintedFetched(address)
  );
  const action = useCallback(
    (address: string) => fetchPreSaleMinted(dispatch, contract)(address),
    [dispatch, contract]
  );
  const web3IsConnected = useAppSelector(web3Selectors.isConnected);
  useEffect(() => {
    if (
      address &&
      web3IsConnected &&
      contract &&
      !isPreSaleMineAvailableFetched
    ) {
      action(address);
    }
  }, [
    web3IsConnected,
    contract,
    address,
    isPreSaleMineAvailableFetched,
    action,
  ]);
  return {
    refetch: action,
    isFetching: useAppSelector(selectors.isPreSaleMintedFetching(address)),
    isFetched: isPreSaleMineAvailableFetched,
    preSaleMinted: useAppSelector(selectors.preSaleMinted(address)),
    error: useAppSelector(selectors.preSaleMintedError(address)),
  };
}
