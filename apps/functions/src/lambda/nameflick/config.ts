if (!process.env.RPC_URL) {
  throw new Error("RPC_URL is not set");
}
export const RPC_URL = process.env.RPC_URL;

if (!process.env.PRIVATE_KEY) {
  throw new Error("PRIVATE_KEY is not set");
}
export const PRIVATE_KEY = process.env.PRIVATE_KEY;

export const ETH_COIN_TYPE = 60;

if (!process.env.ENS_REGISTRAR_ADDRESS) {
  throw new Error("ENS_REGISTRAR_ADDRESS is not set");
}
// const ensRegistry = "0x00000000000c2e074ec69a0dfb2997ba6c7d2e1e";
export const ENS_REGISTRY_ADDRESS = process.env.ENS_REGISTRAR_ADDRESS;
