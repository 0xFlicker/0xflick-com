import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { INameflickMetadata, INameflickToken } from "@0xflick/models";
import { tokens } from "./fixture";

export interface IState {
  ownedTokens: INameflickToken[];
}

const slice = createSlice({
  name: "nameflick-manage",
  initialState: {
    ownedTokens: tokens,
  } as IState,
  reducers: {
    setOwnedTokens: (state, action: PayloadAction<INameflickToken[]>) => {
      state.ownedTokens = action.payload;
    },
  },
});

const selectRoot = (state: { nameflickManage: IState }) =>
  state.nameflickManage;
const selectOwnedTokens = createSelector(
  selectRoot,
  (state) => state.ownedTokens
);

export const selectors = {
  ownedTokens: selectOwnedTokens,
};
export const { actions, reducer } = slice;
