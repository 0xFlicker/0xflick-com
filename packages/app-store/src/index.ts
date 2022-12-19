import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";

import { reducer as web3Reducer } from "@0xflick/feature-web3";
import { reducer as authReducer } from "@0xflick/feature-auth/src/redux";

export const store = configureStore({
  reducer: {
    web3: web3Reducer,
    auth: authReducer,
  },
  devTools: process.env.NODE_ENV !== "production",
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>(); // Export a hook that can be reused to resolve types
export const useAppSelector = <T>(selector: (state: RootState) => T) => {
  return useSelector<RootState, T>(selector);
};
