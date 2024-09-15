import { ParquetSchema, ParquetWriter, ParquetReader } from "parquetjs";

declare module "parquet-lite" {
  // Copy the types you want to merge from `@types/parquetjs`
  export { ParquetSchema, ParquetWriter, ParquetReader };
}
