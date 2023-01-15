import { FC, useCallback, useMemo } from "react";
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
  const { data: isRegistered } = useNameflickContractIsRegistered({
    namehash,
    contractAddress,
  });
  const { write, isLoading, isSuccess, isError, error, data } =
    useNameflickRegisterContract({
      namehash,
      contractAddress,
      enabled:
        !!namehash &&
        !!contractAddress &&
        !!isOwner &&
        !!isApprovedOrOwner &&
        !!recordExists &&
        !!isERC721 &&
        !isRegistered,
    });
  const [
    isResolverSet,
    { write: writeResolver, isLoading: isLoadingResolving },
  ] = useENSSetResolver(namehash);
  const onSubmit = useCallback(() => {
    write?.();
  }, [write]);
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
      </CardActions>
    </Card>
  );
};
