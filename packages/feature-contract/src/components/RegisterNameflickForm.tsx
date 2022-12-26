import { FC, useCallback, useEffect, useState } from "react";
import { Formik, FormikHelpers } from "formik";
import { useFetchOpenSeaCollectionByAddressLazyQuery } from "../graphql/fetchContractDetails.generated";
import { IRegisterContract } from "../types";
import { ContractCard } from "./ContractCard";
import { useIsContractERC721 } from "../wagmi/useIsContractERC721";
import { useAccount, useClient, useNetwork } from "wagmi";
import { utils, Contract } from "ethers";
import { IERC165__factory, ENS__factory } from "@0xflick/contracts";
import { ENSCard } from "./ENSCard";
import Grid2 from "@mui/material/Unstable_Grid2";

export const ERROR_CONTRACT_NOT_ERC721 = "Contract is not ERC721";
export const ERROR_CONTRACT_NOT_ADDRESS = "Invalid contract address";
export const ERROR_CONTRACT_IS_NOT_OWNED_BY_USER =
  "Contract is not owned by user";

const defaultGridBreakpoints = {
  xs: 12,
  sm: 12,
  md: 12,
  lg: 6,
  xl: 6,
};

export const RegisterNameflickForm: FC = () => {
  // We need to know the network because we will only be able to fetch the contract details
  // from OpenSea if the contract is deployed on mainnet
  const { chain } = useNetwork();
  const { address } = useAccount();
  const { provider } = useClient();
  const [isERC721CurrentlyLoading, setIsERC721CurrentlyLoading] =
    useState(false);
  const [isERC721, setIsERC721] = useState<false | string>(false);

  const [fetchOpenSeaCollection, { data, error }] =
    useFetchOpenSeaCollectionByAddressLazyQuery({});

  const onSubmit = useCallback(
    async (
      values: IRegisterContract,
      helpers: FormikHelpers<IRegisterContract>
    ) => {
      setIsERC721CurrentlyLoading(true);
      const errors = await helpers.validateForm(values);

      if (chain?.id === 1) {
        fetchOpenSeaCollection({
          variables: {
            address: values.contractAddress,
          },
        }).finally(() => {
          helpers.setSubmitting(false);
          setIsERC721CurrentlyLoading(false);
        });
      } else {
        helpers.setSubmitting(false);
        setIsERC721CurrentlyLoading(false);
      }
      if (errors.contractAddress === ERROR_CONTRACT_NOT_ERC721) {
        setIsERC721(ERROR_CONTRACT_NOT_ERC721);
      }
    },
    [fetchOpenSeaCollection]
  );

  return (
    <Formik
      initialValues={{
        contractAddress: "",
        ensName: "",
      }}
      onSubmit={onSubmit}
      validateOnChange={false}
      validate={async (values) => {
        const errors: Partial<IRegisterContract> = {};
        if (!address) {
          return;
        }
        try {
          if (values.ensName && provider.network.ensAddress) {
            const ens = ENS__factory.connect(
              provider.network.ensAddress,
              provider
            );
            const namehash = utils.namehash(values.ensName);
            // Check the name exists
            const exists = await ens.recordExists(namehash);
            if (!exists) {
              errors.ensName = "ENS name does not exist";
            } else {
              // Check if the name is owned by the user
              const owner = await ens.owner(namehash);
              if (owner !== address) {
                errors.ensName = "ENS name is not owned by you";
              }
            }
          }
        } catch (e) {
          console.error(e);
          errors.ensName = "ENS name is not valid";
        }

        if (
          values.contractAddress.length &&
          utils.isAddress(values.contractAddress) === false
        ) {
          errors.contractAddress = ERROR_CONTRACT_NOT_ADDRESS;
        } else if (values.contractAddress.length) {
          try {
            const erc165 = IERC165__factory.connect(
              values.contractAddress,
              provider
            );
            const ownableContract = new Contract(
              values.contractAddress,
              ["function owner() view returns (address)"],
              provider
            );
            const [isERC721, isOpenSeaContract, contractOwner] =
              await Promise.all([
                erc165.supportsInterface("0x80ac58cd"),
                fetchOpenSeaCollection({
                  variables: {
                    address: values.contractAddress,
                  },
                }).then((res) => !!res.data?.openSeaCollectionByAddress),
                ownableContract.owner(),
              ]);
            if (!isERC721 && !isOpenSeaContract) {
              errors.contractAddress = ERROR_CONTRACT_NOT_ERC721;
            } else if (contractOwner !== address) {
              errors.contractAddress = ERROR_CONTRACT_IS_NOT_OWNED_BY_USER;
            }
          } catch (e) {
            console.error(e);
          }
        }
        return errors;
      }}
    >
      <Grid2 container spacing={1} alignItems={"stretch"}>
        <Grid2 {...defaultGridBreakpoints}>
          <ENSCard />
        </Grid2>
        <Grid2 {...defaultGridBreakpoints}>
          <ContractCard
            collection={data?.openSeaCollectionByAddress ?? undefined}
            collectionError={error}
            isERC721={
              !!isERC721 || data?.openSeaCollectionByAddress ? true : false
            }
            isERC721CurrentlyLoading={isERC721CurrentlyLoading}
            erc721Error={isERC721 ? undefined : (isERC721 as string)}
          />
        </Grid2>
      </Grid2>
    </Formik>
  );
};
