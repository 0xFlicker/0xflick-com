import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface IState {
  isAffiliate?: boolean;
  affiliateSlugs?: string[];
}

const REDUCER_NAME = "affiliates";
const initialState: IState = {};
export const slice = createSlice({
  name: REDUCER_NAME,
  initialState,
  reducers: {
    setAffiliateSlugs(state, action: PayloadAction<string[]>) {
      state.affiliateSlugs = action.payload;
    },
    setIsAffiliate(state, action: PayloadAction<boolean>) {
      state.isAffiliate = action.payload;
    },
  },
});

const selectRoot = (state: { [REDUCER_NAME]: IState }) => state.affiliates;
const selectIsAffiliate = createSelector(
  selectRoot,
  (state) => state.isAffiliate
);
const selectSlugs = createSelector(selectRoot, (state) => state.affiliateSlugs);

export const selectors = {
  isAffiliate: selectIsAffiliate,
  slugs: selectSlugs,
};

export const { actions, reducer } = slice;
