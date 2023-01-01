import { useMemo } from "react";
import { graphQlAllowedActionToPermission } from "../transforms/allowedActions";
import { useGetSelfQuery } from "./getSelf.generated";

export const useSelf = ({ skip }: { skip?: boolean } = {}) => {
  const { data, ...rest } = useGetSelfQuery({
    skip,
    // fetchPolicy: "no-cache",
    errorPolicy: "all",
  });

  const self = useMemo(
    () =>
      data && data.self
        ? {
            address: data.self.address,
            nonce: data.self.nonce,
            roleIds: data.self.roles?.map((role) => role.id) ?? [],
            allowedActions: data.self.allowedActions.map(
              graphQlAllowedActionToPermission
            ),
            token: data.self.token,
          }
        : undefined,
    [data]
  );

  const isLoggedIn = useMemo(() => !!self, [self]);

  return {
    data: self,
    isLoggedIn,
    ...rest,
  };
};
