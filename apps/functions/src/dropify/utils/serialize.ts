import { makeData, Struct, StructRow, StructRowProxy } from 'apache-arrow';
import { MetadataSchema, metadataSchema } from './schema';

const builder = makeData({
  type: new Struct<MetadataSchema>(metadataSchema.fields),
})

export function toBuffer(jsonString: string): Buffer {
  try {
    const json = JSON.parse(jsonString);
    builder.append(json);
    const built = builder.finish();
    return Buffer.from(built.);
  }
}
