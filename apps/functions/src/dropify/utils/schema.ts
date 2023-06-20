import { Field, List, Struct, Utf8, Float64, Schema } from "apache-arrow";

const attributeStringFields = [
  new Field("value", new Utf8()),
  new Field("trait_type", new Utf8()),
  new Field("colors", new List(new Field("color", new Utf8())), true),
];

export const attributeStringStruct = new Struct(attributeStringFields);

const attributeNumericFields = [
  new Field("value", new Float64()),
  new Field("trait_type", new Utf8()),
  new Field("display_type", new Utf8(), true),
];

export const attributeNumericStruct = new Struct(attributeNumericFields);

export const propertiesStruct = new Struct([
  new Field("key", new Utf8()),
  new Field("value", new Utf8()),
]);

const metadataFields = [
  new Field("image", new Utf8()),
  new Field("description", new Utf8(), true),
  new Field("tokenId", new Utf8(), true),
  new Field("external_url", new Utf8(), true),
  new Field("name", new Utf8()),
  new Field(
    "attributes",
    new List(new Field("attribute", attributeStringStruct))
  ),
  new Field(
    "numericAttributes",
    new List(new Field("numericAttribute", attributeNumericStruct))
  ),
  new Field("properties", new List(new Field("property", propertiesStruct))),
  new Field("edition", new Utf8(), true),
  new Field("id", new Utf8(), true),
];

export const metadataSchema = new Schema(metadataFields);

export type MetadataSchema = {
  image: Utf8;
  description: Utf8;
  tokenId: Utf8;
  external_url: Utf8;
  name: Utf8;
  attributes: List<
    Struct<{
      value: Utf8;
      trait_type: Utf8;
      colors: List<Utf8>;
    }>
  >;
  numericAttributes: List<
    Struct<{
      value: Float64;
      trait_type: Utf8;
      display_type: Utf8;
    }>
  >;
  properties: List<
    Struct<{
      key: Utf8;
      value: Utf8;
    }>
  >;
  id: Utf8;
};
