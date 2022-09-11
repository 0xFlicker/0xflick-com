import { useCallback } from "react";
import {
  DeactivateSlugMutation,
  useDeactivateSlugMutation,
} from "./deactivateSlug.generated";

const EMPTY_SLUGS: string[] = [];
const transform = (data: DeactivateSlugMutation): string[] =>
  data?.affiliateForAddress?.deactivate?.slugs ?? EMPTY_SLUGS;

export function useDeactivateSlug() {
  const [mutate, { data, ...rest }] = useDeactivateSlugMutation();

  const slugs = transform(data);
  const deactivateSlug = useCallback(
    ({ slug, address }: { address: string; slug: string }) =>
      mutate({ variables: { address, slug } }),
    [mutate]
  );

  return {
    deactivateSlug,
    slugs,
    data,
    ...rest,
  };
}
