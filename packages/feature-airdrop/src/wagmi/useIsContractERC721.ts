import { useContractRead } from "wagmi";

export const useIsContractERC721 = (address?: `0x${string}`) => {
  // Strategy... use EIP-165 to check if the contract implements the ERC-721 interface.

  // EIP-165 interface ID for ERC-721
  const ERC721_INTERFACE_ID = "0x80ac58cd";

  const { data, error, refetch } = useContractRead({
    address,
    functionName: "supportsInterface",
    args: [ERC721_INTERFACE_ID],
  });

  return {
    isERC721: data === true,
    error,
    refetch,
  };
};
