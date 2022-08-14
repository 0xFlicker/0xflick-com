import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import fetch from "isomorphic-unfetch";

export interface IPreSaleSignatureResponse {
  signature: string;
  nonce: number;
}

export const api = createApi({
  reducerPath: "mintApi",
  baseQuery: fetchBaseQuery({ baseUrl: `/api/`, fetchFn: fetch }),

  endpoints: (builder) => ({
    preSaleSignature: builder.query<
      IPreSaleSignatureResponse,
      {
        token?: string;
        address: string;
      }
    >({
      query: ({ address, token }) => ({
        url: `presale-mint/${address}`,
        method: "GET",
        headers: {
          Accept: "application/json",
          ...(token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {}),
        },
      }),
    }),
    requestPresaleApproval: builder.query<
      { approved: boolean; token: string },
      void
    >({
      query: () => ({
        url: `presale-mint/approve`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  reducer,
  usePreSaleSignatureQuery,
  useLazyPreSaleSignatureQuery,
  useRequestPresaleApprovalQuery,
  useLazyRequestPresaleApprovalQuery,
} = api;
