import { reducer as mintReducer } from "./redux";

export { selectors } from "./redux";
import { api } from "./api";
export {
  useMint,
  useMaxSupply,
  usePreSaleMaxMintPerAccount,
  usePreSaleMinted as usePreSaleAvailableMints,
  useBalanceOf,
  useTotalSupply,
} from "./hooks";

// export  { IState } from

// extends IMintState {
//   api: Parameters<typeof api.reducer>[0];
// }
// export const reducer = (state: IState, action: any): IState => {
//   const newState = mintReducer(state, action);
//   return {
//     ...newState,
//     api: api.reducer(state?.api, action),
//   };
// };
export { PreSaleMintCard } from "./components/PreSaleMintCard";
export const reducer = mintReducer;
export const apiReducer = api.reducer;
