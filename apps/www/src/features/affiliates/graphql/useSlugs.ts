import { AffiliateQuery } from "graphql/types";
import {
  SlugsQuery,
  useSlugsQuery,
  useSlugsLazyQuery,
} from "./slugs.generated";

const EMPTY_SLUGS: string[] = [];
const transform = (data: SlugsQuery): AffiliateQuery["slugs"] =>
  data?.affiliateForAddress?.slugs ?? EMPTY_SLUGS;

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
  const slugs = transform(data);
  return {
    slugs,
    data,
    ...rest,
  };
}

export function useLazySlugs() {
  const [fetch, { data, ...rest }] = useSlugsLazyQuery();
  const slugs = transform(data);
  return {
    fetch,
    slugs,
    data,
    ...rest,
  };
}
