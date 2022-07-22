/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type { BaseContract, BigNumber, Signer, utils } from "ethers";
import type { EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from "../../../../common";

export interface ERC721RedeemerInterface extends utils.Interface {
  functions: {};

  events: {
    "Redemption(address,address,uint256,uint256)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "Redemption"): EventFragment;
}

export interface RedemptionEventObject {
  token: string;
  redeemer: string;
  tokenId: BigNumber;
  n: BigNumber;
}
export type RedemptionEvent = TypedEvent<
  [string, string, BigNumber, BigNumber],
  RedemptionEventObject
>;

export type RedemptionEventFilter = TypedEventFilter<RedemptionEvent>;

export interface ERC721Redeemer extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: ERC721RedeemerInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {};

  callStatic: {};

  filters: {
    "Redemption(address,address,uint256,uint256)"(
      token?: PromiseOrValue<string> | null,
      redeemer?: PromiseOrValue<string> | null,
      tokenId?: null,
      n?: null
    ): RedemptionEventFilter;
    Redemption(
      token?: PromiseOrValue<string> | null,
      redeemer?: PromiseOrValue<string> | null,
      tokenId?: null,
      n?: null
    ): RedemptionEventFilter;
  };

  estimateGas: {};

  populateTransaction: {};
}