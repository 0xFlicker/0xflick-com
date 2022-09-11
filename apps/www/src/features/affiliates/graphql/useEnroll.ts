import { useCallback } from "react";
import {
  EnrollAffiliateMutation,
  useEnrollAffiliateMutation,
} from "./enroll.generated";

const transform = (data: EnrollAffiliateMutation): string =>
  data?.createAffiliate?.role?.name;

export function useEnroll() {
  const [mutate, { data, ...rest }] = useEnrollAffiliateMutation();

  const roleName = transform(data);

  const enroll = useCallback(
    ({ address }: { address: string }) => {
      mutate({ variables: { address } });
    },
    [mutate]
  );

  return {
    enroll,
    roleName,
    data,
    ...rest,
  };
}
