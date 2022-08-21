// From https://github.com/satoshilabs/slips/blob/master/slip-0044.md
// Kind of amazing that copilot can figure these out
// TODO: Add more coins, and add support to the db

export const BTC = 0;
export const LTC = 2;
export const DOGE = 3;
export const ETH = 60;

// Reverse lookup
const coinTypeToNameLookup: Record<number, string> = {
  0: "BTC",
  2: "LTC",
  3: "DOGE",
  60: "ETH",
};

export const coinTypeToName = (coinType: number) => {
  if (coinTypeToNameLookup[coinType]) {
    return coinTypeToNameLookup[coinType];
  }
  throw new Error(`Unknown coin type: ${coinType}`);
};
