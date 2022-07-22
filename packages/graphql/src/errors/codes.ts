import { TReason as TContractReasons } from "./contract";
import { TReason as TEnsReasons } from "./ens";
import { TReason as TMetadataReasons } from "./metadata";

export type TErrorCodes = TContractReasons | TEnsReasons | TMetadataReasons;
