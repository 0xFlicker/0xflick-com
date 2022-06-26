import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";

interface IState {
  darkMode: boolean;
}
const initialState: IState = {
  darkMode: false,
};

const slice = createSlice({
  name: "appbar",
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
    },
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.darkMode = action.payload;
    },
  },
});

const selectRoot = (state: { appbar: IState }) => state.appbar;
export const selectDarkMode = createSelector(
  selectRoot,
  (state) => state.darkMode
);

export const selectors = {
  darkMode: selectDarkMode,
};

export const actions = slice.actions;
export const reducer = slice.reducer;
