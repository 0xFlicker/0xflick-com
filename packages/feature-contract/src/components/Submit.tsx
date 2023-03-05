import { FC, useCallback, useEffect, useMemo } from "react";
import { useFormikContext } from "formik";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import CircularProgress from "@mui/material/CircularProgress";
import { StatusField } from "@0xflick/components/src/StatusField";
import { utils } from "ethers";
import { hexString } from "@0xflick/utils";
import { IRegisterContract } from "../types";
import { useNameflickRegisterContract } from "../wagmi/useNameflickRegisterContract";
import { useEnsAccountIsApproved } from "../wagmi/useEnsAccountIsApproved";
import { useENSNFTOwner } from "../wagmi/useENSNFTOwner";
import { useNameflickContractIsRegistered } from "../wagmi/useNameflickContractIsRegistered";
import { useENSSetResolver } from "../wagmi/useENSSetResolver";
import { useAuth } from "@0xflick/feature-auth/src/hooks";

export const Submit: FC<{
  isERC721?: boolean;
}> = ({ isERC721 }) => {
  const { values } = useFormikContext<IRegisterContract>();
  const { ensName } = values;
  const { isApprovedOrOwner, recordExists, refetch } = useEnsAccountIsApproved(
    values.ensName
  );
  const namehash = useMemo(() => {
    if (ensName) {
      try {
        return hexString(utils.namehash(ensName));
      } catch (e) {
        // ignore
      }
    }
    return undefined;
  }, [ensName]);
  const contractAddress = useMemo(() => {
    if (values.contractAddress) {
      try {
        return hexString(values.contractAddress);
      } catch (e) {
        // ignore
      }
    }
    return undefined;
  }, [values.contractAddress]);
  let { isOwner, isSuccess: ensNftOwnerIsSuccess } = useENSNFTOwner(ensName);
  isOwner = isOwner && ensNftOwnerIsSuccess;
  const { data: isRegistered, refetch: refetchIsRegistered } =
    useNameflickContractIsRegistered({
      namehash,
      contractAddress,
    });
  const { isAnonymous, isAuthenticated, signIn } = useAuth();
  const { write, isLoading, isSuccess, isError, error, data } =
    useNameflickRegisterContract({
      namehash,
      contractAddress,
    });
  useEffect(() => {
    if (isSuccess) {
      refetchIsRegistered();
    }
  }, [isSuccess, refetchIsRegistered]);
  const [
    { isResolverSet, refetch: refetchIsSetAsResolver },
    {
      write: writeResolver,
      isLoading: isLoadingResolving,
      isSuccess: isSuccessResolving,
    },
  ] = useENSSetResolver(namehash);
  useEffect(() => {
    if (isSuccessResolving) {
      refetchIsRegistered();
    }
  }, [isSuccessResolving, refetchIsRegistered]);
  const onSubmit = useCallback(() => {
    write?.();
  }, [write]);
  const onRefresh = useCallback(() => {
    refetch?.();
    refetchIsRegistered?.();
    refetchIsSetAsResolver?.();
  }, [refetch, refetchIsRegistered, refetchIsSetAsResolver]);
  return (
    <Card
      sx={{
        height: "100%",
      }}
    >
      <CardHeader title="Submit" />
      <CardContent>
        <StatusField checked={!!recordExists}>ENS Name exists</StatusField>
        <StatusField checked={isOwner}>ENS Name is owned by you</StatusField>
        <StatusField checked={!!isApprovedOrOwner}>
          ENS Name is registered
        </StatusField>
        <StatusField checked={!!isERC721}>ERC721 is valid</StatusField>
        <StatusField checked={!!isRegistered}>
          ENS is connected to contract (try submit)
        </StatusField>
        <StatusField checked={!!isResolverSet}>
          ENS resolver set to nameflick (try set resolver)
        </StatusField>
      </CardContent>
      <CardActions>
        {isAnonymous && !isAuthenticated && (
          <Button variant="contained" onClick={signIn}>
            Login
          </Button>
        )}
        {!isRegistered && (
          <Button
            variant="contained"
            onClick={onSubmit}
            disabled={
              !recordExists ||
              !isERC721 ||
              !isApprovedOrOwner ||
              !isOwner ||
              isLoading ||
              isSuccess
            }
            startIcon={isLoading && <CircularProgress size={20} />}
          >
            Submit
          </Button>
        )}
        {!isResolverSet && (
          <Button
            variant="contained"
            onClick={() => writeResolver?.()}
            disabled={!isRegistered || isLoadingResolving}
            startIcon={isLoadingResolving && <CircularProgress size={20} />}
          >
            Set Resolver
          </Button>
        )}
        <Button variant="contained" onClick={onRefresh}>
          Refresh
        </Button>
      </CardActions>
    </Card>
  );
};
