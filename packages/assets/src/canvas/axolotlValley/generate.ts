import { omit } from "ramda";
import type { IMetadata } from "@0xflick/models";
import { ILayer } from "../core";
import { mapWeightedValuesToRange, weightSampleFromWeights } from "../utils";
import {
  makeAccessoriesLayer,
  makeArmsLayer,
  makeBackgroundLayer,
  makeBaseLayer,
  makeSpecialOrHeadThingsLayer,
  makeOutlineLayer,
  makeTailLayer,
} from "./operations";
import { BaseColor } from "./types";
import * as weights from "./weights";
import { utils } from "ethers";
import { IImageFetcher } from "../cache";

function chompLast256bits(inNum: number): number {
  return inNum % 256;
}

export type IAttributeMetadata = Omit<
  IMetadata,
  "name" | "image" | "tokenId"
> & {
  seed: string;
};

export function generateTraits(_seed: Uint8Array) {
  let seed = _seed;
  const seedChomper = (range: number) => {
    if (range != 255) {
      throw new Error(`Expected a range of 255 but got ${range}`);
    }
    const value = seed[0];
    seed = seed.slice(1);
    return value;
  };
  const backgroundColor = weightSampleFromWeights(
    weights.backgroundWeights,
    seedChomper
  );
  const baseColor = weightSampleFromWeights(weights.colorWeights, seedChomper);
  const split = weightSampleFromWeights(weights.splitWeights, seedChomper);
  let secondaryColor: BaseColor | undefined;
  if (split === "Split") {
    const secondaryColorWeights = mapWeightedValuesToRange(
      0,
      255,
      omit([baseColor], weights.colorWeights)
    );
    secondaryColor = weightSampleFromWeights(
      secondaryColorWeights,
      seedChomper
    );
  } else {
    // Eat the alt color
    seed = seed.slice(1);
  }
  const accessory = weightSampleFromWeights(
    weights.accessoryWeights,
    seedChomper
  );
  const accessoryColor = weightSampleFromWeights(
    weights.accessoryColorWeights,
    seedChomper
  );
  const tail = weightSampleFromWeights(weights.tailWeights, seedChomper);
  const arm = weightSampleFromWeights(weights.armWeights, seedChomper);
  const frills = weightSampleFromWeights(weights.frillWeights, seedChomper);
  const face = weightSampleFromWeights(weights.faceWeights, seedChomper);
  const mouth = weightSampleFromWeights(weights.mouthWeights, seedChomper);
  const head = weightSampleFromWeights(weights.headWeights, seedChomper);
  const special = weightSampleFromWeights(
    weights.specialFeatureWeights,
    seedChomper
  );

  const metadata: IAttributeMetadata = {
    seed: utils.hexlify(_seed),
    attributes: [
      {
        trait_type: "Background Color",
        value: backgroundColor,
      },
      {
        trait_type: "Base Color",
        value: baseColor,
      },
      ...(split === "Split"
        ? [{ trait_type: "Secondary Color", value: secondaryColor }]
        : []),
      ...(special !== "None"
        ? [{ trait_type: "Special Feature", value: special }]
        : []),
      {
        trait_type: "Accessory",
        value: accessory,
      },
      ...(accessory === "Hoodie"
        ? [
            {
              trait_type: "Accessory Color",
              value: accessoryColor,
            },
          ]
        : []),
      {
        trait_type: "Tail",
        value: tail,
      },
      {
        trait_type: "Arm",
        value: arm,
      },
      {
        trait_type: "Frills",
        value: frills,
      },
      {
        trait_type: "Face",
        value: face,
      },
      {
        trait_type: "Mouth",
        value: mouth,
      },
      {
        trait_type: "Head",
        value: head,
      },
    ],
  };
  return {
    metadata,
    arm,
    special,
    accessory,
    accessoryColor,
    backgroundColor,
    baseColor,
    split,
    secondaryColor,
    tail,
    face,
    frills,
    mouth,
    head,
  };
}

export default async function (
  _seed: Uint8Array,
  imageFetcher: IImageFetcher
): Promise<{
  metadata: IAttributeMetadata;
  layers: ILayer[];
}> {
  const {
    metadata,
    arm,
    special,
    accessory,
    accessoryColor,
    backgroundColor,
    baseColor,
    secondaryColor,
    tail,
    face,
    frills,
    mouth,
    head,
  } = generateTraits(_seed);
  return {
    metadata,
    layers: [
      makeBackgroundLayer({ color: backgroundColor }, imageFetcher),
      await makeBaseLayer(
        { color: baseColor, splitColor: secondaryColor },
        imageFetcher
      ),
      ...(await makeAccessoriesLayer(
        {
          accessoryType: accessory,
          color: accessoryColor,
        },
        imageFetcher
      )),
      ...(await makeArmsLayer(
        {
          armType: arm,
          color: baseColor,
          splitColor: secondaryColor,
        },
        imageFetcher
      )),
      ...(await makeSpecialOrHeadThingsLayer(
        {
          frillType: frills,
          faceType: face,
          mouthType: mouth,
          headType: head,
          specialType: special,
          color: baseColor,
          splitColor: secondaryColor,
        },
        imageFetcher
      )),
      makeOutlineLayer(imageFetcher),
      ...(await makeTailLayer(
        {
          color: baseColor,
          splitColor: secondaryColor,
          tailType: tail,
        },
        imageFetcher
      )),
    ],
  };
}
