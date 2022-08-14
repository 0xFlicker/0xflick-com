import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const api = createApi({
  reducerPath: "twitterApi",
  baseQuery: fetchBaseQuery({ baseUrl: `/api/` }),
  endpoints: (builder) => ({
    isFollowing: builder.query<
      { following: boolean } | { needsLogin: boolean },
      void
    >({
      query: () => ({
        url: `/twitter/is-following`,
        method: "GET",
      }),
    }),
  }),
});

export const { reducer, useIsFollowingQuery } = api;
