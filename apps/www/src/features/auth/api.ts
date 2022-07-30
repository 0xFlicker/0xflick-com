import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import fetch from "isomorphic-unfetch";

export interface INonceResponse {
  nonce: number;
}

export interface ITokenResponse {
  token: string;
}

export const api = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({ baseUrl: `/api/`, fetchFn: fetch }),
  endpoints: (builder) => ({
    nonce: builder.query<INonceResponse, string>({
      query: (address) => ({
        url: `${address}/nonce`,
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }),
    }),
    signIn: builder.query<ITokenResponse, { address: string; jwe: string }>({
      query: ({ address, jwe }) => ({
        url: `${address}/sign-in`,
        method: "POST",
        body: {
          jwe,
        },
      }),
    }),
    signOut: builder.query<string, void>({
      query: () => ({
        url: "/auth/sign-out",
        method: "GET",
      }),
    }),
  }),
});

export const {
  reducer,
  useLazyNonceQuery,
  useNonceQuery,
  usePrefetch,
  useLazySignInQuery,
  useLazySignOutQuery,
} = api;
