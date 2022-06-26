import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { INfts } from "models/nfts";

type TGetNftCollectionQuery = INfts[];

const api = createApi({
  reducerPath: "apiNftCollection",
  baseQuery: fetchBaseQuery({ baseUrl: `/api/`, fetchFn: fetch }),
  endpoints: (builder) => ({
    getNftCollection: builder.query<TGetNftCollectionQuery, void>({
      query: () => "nft-collection",
    }),
  }),
});

export const {
  reducer,
  useLazyGetNftCollectionQuery,
  useGetNftCollectionQuery,
  usePrefetch,
} = api;
