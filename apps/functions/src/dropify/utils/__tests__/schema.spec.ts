import {
  List,
  makeData,
  Struct,
  StructRow,
  StructRowProxy,
  Utf8,
  vectorFromArray,
  Float64,
  Field,
  Table,
  tableFromJSON,
} from "apache-arrow";
import type { WriteStream } from "fs";
import {
  ParquetWriter as NewParquetWrite,
  ParquetSchema as NewParquetSchema,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
} from "parquet-lite";
import {
  ParquetWriter as OldParquetWriter,
  ParquetSchema as OldParquetSchema,
} from "parquetjs";
import { Readable, Writable, Stream } from "stream";
import {
  attributeNumericStruct,
  attributeStringStruct,
  MetadataSchema,
  metadataSchema,
  propertiesStruct,
} from "../schema";

import { fakeMetadata } from "../fixture";
import {
  IMetadata,
  IAttributeString,
  IAttributeNumeric,
  IMetadataAttribute,
} from "@0xflick/models";

const ParquetWriter = NewParquetWrite as typeof OldParquetWriter;
const ParquetSchema = NewParquetSchema as typeof OldParquetSchema;

function makeStructRow(index: number) {
  const struct = makeData({
    type: new Struct<MetadataSchema>(metadataSchema.fields),
  });
  return new StructRow(struct, index) as StructRowProxy<MetadataSchema>;
}

function applyData(row: StructRowProxy<MetadataSchema>, data: IMetadata) {
  const [stringAttributes, numericAttributes] = data.attributes.reduce(
    ([stringAttributes, numericAttributes], attribute) => {
      if (typeof attribute.value === "string") {
        stringAttributes.push({
          ...attribute,
          colors: "colors" in attribute ? attribute.colors : null,
        } as IAttributeString);
      } else {
        numericAttributes.push({
          ...attribute,
          display_type:
            "display_type" in attribute ? attribute.display_type : null,
        } as IAttributeNumeric);
      }
      return [stringAttributes, numericAttributes];
    },
    [[], []] as [IAttributeString[], IAttributeNumeric[]]
  );
  row.image = data.image;
  row.description = data.description;
  row.tokenId = data.tokenId;
  row.external_url = data.external_url;
  row.name = data.name;
  row.attributes = vectorFromArray<
    Struct<{
      value: Utf8;
      trait_type: Utf8;
      colors: List<Utf8>;
    }>
  >(stringAttributes, attributeStringStruct);
  row.numericAttributes = vectorFromArray<
    Struct<{
      value: Float64;
      trait_type: Utf8;
      display_type: Utf8;
    }>
  >(numericAttributes, attributeNumericStruct);
  if (data.properties) {
    row.properties = vectorFromArray(
      Object.entries(data.properties).map(([key, value]) => ({ key, value })),
      propertiesStruct
    );
  }

  row.id = data.id?.toString() ?? null;
}

interface INormalizedAttribute {
  string_value: string | null;
  numeric_value: number | null;
  trait_type: string;
  display_type: string | null;
  colors: string[] | null;
  tokenId: string;
  contractAddress: string;
}

const normalizedAttributeSchema = new ParquetSchema({
  string_value: { type: "UTF8" },
  numeric_value: { type: "DOUBLE" },
  trait_type: { type: "UTF8" },
  display_type: { type: "UTF8" },
  colors: {
    repeated: true,
    type: "UTF8",
  },
  tokenId: { type: "UTF8" },
  contractAddress: { type: "UTF8" },
});

describe("Schema", () => {
  it("can make one", () => {
    const now = Date.now();
    console.log("Start makeData");
    const row = makeStructRow(0);
    try {
      applyData(row, fakeMetadata());
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      console.log("End makeData", Date.now() - now);
    }
    expect(row.toJSON()).toMatchSnapshot();
  });

  function normalizeAttributes(
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
        display_type:
          "display_type" in attribute ? attribute.display_type : null,
        colors: null,
        tokenId,
        contractAddress,
      };
    });
  }

  it("vector from schema", () => {
    const testMetadataSchema = new Struct([
      new Field("string_value", new Utf8(), true),
      new Field("numeric_value", new Float64(), true),
      new Field("trait_type", new Utf8(), false),
      new Field("display_type", new Utf8(), true),
      new Field("colors", new List(new Field("color", new Utf8())), true),
      new Field("tokenId", new Utf8(), false),
      new Field("contractAddress", new Utf8(), false),
    ]);
    const vector = vectorFromArray(
      normalizeAttributes("1", "0x1", fakeMetadata().attributes),
      testMetadataSchema
    );
    expect(vector.toJSON()).toMatchSnapshot();
  });

  it("table from schema", async () => {
    const table = tableFromJSON(
      normalizeAttributes(
        "1",
        "0x1",
        fakeMetadata().attributes
      ) as unknown as Record<string, unknown>[]
    );
    const writableStream = new WritableStream();

    const writer = await ParquetWriter.openStream(
      normalizedAttributeSchema,
      writableStream as unknown as WriteStream
    );
    const parquetData: Buffer[] = [];
    writableStream.on("data", (data) => {
      parquetData.push(data);
    });

    return new Promise<void>(async (resolve, reject) => {
      writableStream.on("finish", () => {
        resolve();
      });
      writableStream.on("error", (error) => {
        reject(error);
      });
      for (const row of table) {
        await writer.appendRow(row);
      }
      writer.close();
    });
  });
});
