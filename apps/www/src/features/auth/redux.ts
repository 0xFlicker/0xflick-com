import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface IState {
  isAnonymous: boolean;
  isAuthenticated: boolean;
  isUserRequestingSignIn: boolean;
  isUserSigningOut: boolean;
  isUserSigningMessage: boolean;

  signature?: string;
  token?: string;
  roles: string[];
}

export const initialState: IState = {
  /* State */
  isAnonymous: true,
  isAuthenticated: false,
  isUserRequestingSignIn: false,
  isUserSigningOut: false,
  isUserSigningMessage: false,

  /* JWT Token */
  token: undefined,
  roles: [],
};

const slice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    userRequestsSignIn: (state) => {
      state.isUserSigningOut = false;
      state.isUserRequestingSignIn = true;
    },
    userNeedsSignature: (state) => {
      state.isUserRequestingSignIn = false;
      state.isUserSigningMessage = true;
    },
    userSignatureRejected: (state) => {
      state.isUserRequestingSignIn = false;
      state.isUserSigningMessage = false;
    },
    userSignatureError: (state) => {
      state.isUserRequestingSignIn = false;
      state.isUserSigningMessage = false;
    },
    userMessageSigned: (state, action: PayloadAction<string>) => {
      state.isUserRequestingSignIn = false;
      state.isUserSigningMessage = false;
      state.signature = action.payload;
    },
    userSignInSuccess: (
      state,
      action: PayloadAction<{ token: string; roles: string[] }>
    ) => {
      state.isUserRequestingSignIn = false;
      state.isAuthenticated = true;
      state.isAnonymous = false;
      state.signature = undefined;
      state.token = action.payload.token;
      state.roles = action.payload.roles;
    },
    userSignInError: (state) => {
      state.isUserRequestingSignIn = false;
      state.isAuthenticated = false;
      state.signature = undefined;
      state.token = undefined;
      state.roles = [];
    },
    userSignOut: (state) => {
      state.isUserSigningOut = true;
      state.isAnonymous = true;
      state.isAuthenticated = false;
      state.signature = undefined;
      state.isUserRequestingSignIn = false;
      state.isUserSigningMessage = false;
      // TODO: Implement tokencide
      state.token = undefined;
      state.roles = [];
    },
  },
});

const selectRoot = (state: { auth: IState }) => state.auth;
const selectToken = createSelector(selectRoot, (state) => state.token);
const selectRoles = createSelector(selectRoot, (state) => state.roles);
const selectIsAnonymous = createSelector(
  selectRoot,
  (state) => state.isAnonymous
);
const selectIsAuthenticated = createSelector(
  selectRoot,
  (state) => state.isAuthenticated
);
const selectIsUserRequestingSignIn = createSelector(
  selectRoot,
  (state) => state.isUserRequestingSignIn
);
const selectIsUserSigningOut = createSelector(
  selectRoot,
  (state) => state.isUserSigningOut
);
const selectIsUserSigningMessage = createSelector(
  selectRoot,
  (state) => state.isUserSigningMessage
);

export const selectors = {
  token: selectToken,
  roles: selectRoles,
  isAnonymous: selectIsAnonymous,
  isAuthenticated: selectIsAuthenticated,
  isUserRequestingSignIn: selectIsUserRequestingSignIn,
  isUserSigningOut: selectIsUserSigningOut,
  isUserSigningMessage: selectIsUserSigningMessage,
};

export const { reducer, actions } = slice;
