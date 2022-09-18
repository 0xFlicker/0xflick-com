import { AffiliateQuery } from "graphql/types";
import {
  SlugsQuery,
  useSlugsQuery,
  useSlugsLazyQuery,
} from "./slugs.generated";

const EMPTY_SLUGS: string[] = [];
const transformSlugs = (data: SlugsQuery): AffiliateQuery["slugs"] =>
  data?.affiliateForAddress?.slugs ?? EMPTY_SLUGS;
const transformCount = (
  data: SlugsQuery
): AffiliateQuery["role"]["userCount"] =>
  data?.affiliateForAddress?.role?.userCount ?? 0;

export function useSlugs({
  address,
  skip,
}: {
  address: string;
  skip?: boolean;
}) {
  const { data, ...rest } = useSlugsQuery({
    variables: { address },
    skip,
  });
  const slugs = transformSlugs(data);
  const count = transformCount(data);
  return {
    slugs,
    data,
    count,
    ...rest,
  };
}

export function useLazySlugs() {
  const [fetch, { data, ...rest }] = useSlugsLazyQuery();
  const slugs = transformSlugs(data);
  const count = transformCount(data);
  return {
    fetch,
    slugs,
    count,
    data,
    ...rest,
  };
}
