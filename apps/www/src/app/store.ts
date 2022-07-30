import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";

import { reducer as web3Reducer } from "features/web3/redux";
import { reducer as configReducer } from "features/config/redux";
// import { reducer as mintReducer } from "features/mint/redux";
// import { reducer as mintApiReducer } from "features/mint/api";
// import { reducer as recaptchaReducer } from "features/faucet/recaptcha";
import { reducer as authReducer } from "features/auth/redux";
import { reducer as authApiReducer } from "features/auth/api";
// import { reducer as adminApiReducer } from "features/admin/api";
import { reducer as appbarReducer } from "features/appbar/redux";
import { reducer as nftCollectionApiReducer } from "features/nft-collection/api";

export const store = configureStore({
  reducer: {
    config: configReducer,
    web3: web3Reducer,
    // mint: mintReducer,
    // mintApi: mintApiReducer,
    // recaptcha: recaptchaReducer,
    auth: authReducer,
    authApi: authApiReducer,
    // adminApi: adminApiReducer,
    appbar: appbarReducer,
    apiNftCollection: nftCollectionApiReducer,
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
