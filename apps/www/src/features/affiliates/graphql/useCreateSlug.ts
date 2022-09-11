import { useCallback } from "react";
import {
  CreateSlugMutation,
  useCreateSlugMutation,
} from "./createSlug.generated";

const EMPTY_SLUGS: string[] = [];
const transform = (data: CreateSlugMutation): string[] =>
  data?.affiliateForAddress?.createSlug?.slugs ?? EMPTY_SLUGS;

export function useCreateSlug() {
  const [mutate, { data, ...rest }] = useCreateSlugMutation();

  const slugs = transform(data);
  const createSlug = useCallback(
    ({ address }: { address: string }) => {
      mutate({ variables: { address } });
    },
    [mutate]
  );
  return {
    createSlug,
    slugs,
    data,
    ...rest,
  };
}
