import { useSubmitPublicResolverMutation } from "./submitPublicResolver.generated";

export const useSubmitPublicResolver = () => {
  const [submit, mutationResult] = useSubmitPublicResolverMutation();

  return {
    submit,
    etherscan: mutationResult.data?.createOrUpdateNameflick?.etherscan,
    error: mutationResult.error,
    loading: mutationResult.loading,
    called: mutationResult.called,
  };
};
