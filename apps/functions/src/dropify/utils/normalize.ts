import { IMetadataAttribute } from "@0xflick/models";

export interface INormalizedAttribute {
  string_value: string | null;
  numeric_value: number | null;
  trait_type: string;
  display_type: string | null;
  colors: string[] | null;
  tokenId: string;
  contractAddress: string;
}

export function normalizeAttributes(
  tokenId: string,
  contractAddress: string,
  attributes: IMetadataAttribute[]
): INormalizedAttribute[] {
  return attributes.map((attribute) => {
    if (typeof attribute.value === "string") {
      return {
        string_value: attribute.value,
        numeric_value: null,
        trait_type: attribute.trait_type,
        display_type: null,
        colors: "colors" in attribute ? attribute.colors : null,
        tokenId,
        contractAddress,
      };
    }
    return {
      string_value: null,
      numeric_value: attribute.value,
      trait_type: attribute.trait_type,
      display_type: "display_type" in attribute ? attribute.display_type : null,
      colors: null,
      tokenId,
      contractAddress,
    };
  });
}
