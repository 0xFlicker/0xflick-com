import { createFilter, FilterOperations, hexToVector3 } from "../filters";
import {
  cachedDrawImage,
  composeDrawOps,
  composeWithCanvas,
  ILayer,
} from "../core";
import { resolveProperties } from "../utils";
import {
  BackgroundColors,
  BaseColor,
  TailTypes,
  IFrillType,
  IFaceType,
  IHeadType,
  IArmType,
  IAccessoriesType,
  IMouthType,
  ISpecialType,
  HoodieColor,
} from "./types";
import {
  accentBlack,
  accentBrown,
  accentHoodieOrange,
  accentHoodiePurple,
  accentHoodieRed,
  accentLime,
  accentPeach,
  accentPink,
  accentRed,
  accentWhite,
  baseBlack,
  baseBrown,
  baseHoodieOrange,
  baseHoodiePurple,
  baseHoodieRed,
  baseLime,
  basePeach,
  basePink,
  baseRed,
  baseWhite,
  pureGreen,
} from "./colors";
import { IImageFetcher } from "../cache";

type ApplyFilter = (o: FilterOperations) => unknown;
interface Colorizer {
  color: string;
  filter: ApplyFilter[];
}
const baseColorDetails: Colorizer[] = [
  {
    color: "Pink",
    filter: [(f) => f.chromaKey(pureGreen, basePink)],
  },
  {
    color: "Peach",
    filter: [(f) => f.chromaKey(pureGreen, basePeach)],
  },
  {
    color: "Brown",
    filter: [(f) => f.chromaKey(pureGreen, baseBrown)],
  },
  { color: "White", filter: [(f) => f.chromaKey(pureGreen, baseWhite)] },
  {
    color: "Lime",
    filter: [(f) => f.chromaKey(pureGreen, baseLime)],
  },
  { color: "Black", filter: [(f) => f.chromaKey(pureGreen, baseBlack)] },
  { color: "Red", filter: [(f) => f.chromaKey(pureGreen, baseRed)] },
];

const accentColorDetails: Colorizer[] = [
  {
    color: "Pink",
    filter: [(f) => f.chromaKey(pureGreen, accentPink)],
  },
  {
    color: "Peach",
    filter: [(f) => f.chromaKey(pureGreen, accentPeach)],
  },
  {
    color: "Brown",
    filter: [(f) => f.chromaKey(pureGreen, accentBrown)],
  },
  { color: "White", filter: [(f) => f.chromaKey(pureGreen, accentWhite)] },
  {
    color: "Lime",
    filter: [(f) => f.chromaKey(pureGreen, accentLime)],
  },
  { color: "Black", filter: [(f) => f.chromaKey(pureGreen, accentBlack)] },
  { color: "Red", filter: [(f) => f.chromaKey(pureGreen, accentRed)] },
];

const hoodieBaseDetails: Colorizer[] = [
  {
    color: "Red",
    filter: [(f) => f.chromaKey(pureGreen, baseHoodieRed)],
  },
  {
    color: "Purple",
    filter: [(f) => f.chromaKey(pureGreen, baseHoodiePurple)],
  },
  {
    color: "Orange",
    filter: [(f) => f.chromaKey(pureGreen, baseHoodieOrange)],
  },
];

const hoodieAccentDetails: Colorizer[] = [
  {
    color: "Red",
    filter: [(f) => f.chromaKey(pureGreen, accentHoodieRed)],
  },
  {
    color: "Purple",
    filter: [(f) => f.chromaKey(pureGreen, accentHoodiePurple)],
  },
  {
    color: "Orange",
    filter: [(f) => f.chromaKey(pureGreen, accentHoodieOrange)],
  },
];

function isSpecialColor(color: string) {
  return ["Diamond", "Gold"].includes(color);
}

interface IBackgroundLayer {
  color: BackgroundColors;
}

export function makeBackgroundLayer(
  { color }: IBackgroundLayer,
  imageFetcher: IImageFetcher
) {
  return {
    draw: cachedDrawImage(resolveProperties(`${color}.webp`), imageFetcher),
    zIndex: -Infinity,
  };
}

interface ISplitLayer<
  PrimaryColor extends string,
  SecondaryColor extends string
> {
  baseColor: PrimaryColor;
  baseColorBasePath: string;
  secondaryColor?: SecondaryColor;
  secondaryColorBasePath: string;
  zIndex: number;
}

function applyColorFilters(colorDetails: Colorizer[], color: string) {
  const ops: ILayer["draw"][] = [];
  const filters = colorDetails.find((c) => c.color === color)?.filter;
  if (filters) {
    ops.push(
      ...filters.map((filterOp) => {
        const [ops, filter] = createFilter();
        filterOp(filter);
        return ops();
      })
    );
  }
  return ops;
}

function makeLegacySplitColorGenerator<
  PrimaryColor extends string,
  SecondaryColor extends string
>(
  {
    zIndex,
    baseColor,
    secondaryColor,
    baseColorBasePath,
    secondaryColorBasePath,
  }: ISplitLayer<PrimaryColor, SecondaryColor>,
  imageFetcher: IImageFetcher
) {
  let drawOp: ILayer["draw"];

  if (secondaryColor) {
    drawOp = composeDrawOps(
      cachedDrawImage(
        resolveProperties(`${baseColorBasePath}/${baseColor}.webp`),
        imageFetcher
      ),
      cachedDrawImage(
        resolveProperties(`${secondaryColorBasePath}/${secondaryColor}.webp`),
        imageFetcher
      )
    );
  } else {
    drawOp = cachedDrawImage(
      resolveProperties(`${baseColorBasePath}/${baseColor}.webp`),
      imageFetcher
    );
  }

  return {
    draw: drawOp,
    zIndex,
  };
}

async function makeSplitColorGenerator<
  PrimaryColor extends string,
  SecondaryColor extends string
>(
  {
    zIndex,
    baseColor,
    secondaryColor,
    baseColorBasePath,
    secondaryColorBasePath,
  }: ISplitLayer<PrimaryColor, SecondaryColor>,
  imageFetcher: IImageFetcher
) {
  let drawOp: ILayer["draw"];

  function applyColor(
    colorDetails: Colorizer[],
    color: string,
    basePath: string,
    baseColorPath: string
  ) {
    const isSpecialColor = ["Diamond", "Gold"].includes(color);
    const ops = [
      cachedDrawImage(
        resolveProperties(
          `${basePath}/${isSpecialColor ? color : baseColorPath}.webp`
        ),
        imageFetcher
      ),
    ];
    if (!isSpecialColor) {
      ops.push(...applyColorFilters(colorDetails, color));
    }
    return ops;
  }

  const baseColorOps = applyColor(
    baseColorDetails,
    baseColor,
    baseColorBasePath,
    "BaseColor"
  );
  const secondaryColorOps = secondaryColor
    ? applyColor(
        baseColorDetails,
        secondaryColor,
        secondaryColorBasePath,
        "SplitColor"
      )
    : [];

  drawOp = composeDrawOps(
    await composeWithCanvas(...baseColorOps),
    await composeWithCanvas(...secondaryColorOps)
  );

  return {
    draw: drawOp,
    zIndex,
  };
}

function makeConditionalColorGenerator<
  PrimaryColor extends string,
  SecondaryColor extends string
>(
  {
    zIndex,
    baseColor,
    secondaryColor,
    baseColorBasePath,
    secondaryColorBasePath,
  }: ISplitLayer<PrimaryColor, SecondaryColor>,
  imageFetcher: IImageFetcher
) {
  let drawOp: ILayer["draw"];

  if (secondaryColor) {
    drawOp = cachedDrawImage(
      resolveProperties(`${secondaryColorBasePath}/${secondaryColor}.webp`),
      imageFetcher
    );
  } else {
    drawOp = cachedDrawImage(
      resolveProperties(`${baseColorBasePath}/${baseColor}.webp`),
      imageFetcher
    );
  }

  return {
    draw: drawOp,
    zIndex,
  };
}

interface IBaseLayer {
  color: BaseColor;
  splitColor?: BaseColor;
}

export function makeBaseLayer(
  { color, splitColor }: IBaseLayer,
  imageFetcher: IImageFetcher
) {
  return makeSplitColorGenerator(
    {
      zIndex: -100000,
      baseColor: color,
      secondaryColor: splitColor,
      baseColorBasePath: "BaseColor",
      secondaryColorBasePath: "SplitColor",
    },
    imageFetcher
  );
}

interface ITailLayer extends IBaseLayer {
  tailType: TailTypes;
}

export async function makeTailLayer(
  { color, splitColor, tailType }: ITailLayer,
  imageFetcher: IImageFetcher
) {
  const ops: ILayer["draw"][] = [];
  color = splitColor ?? color;
  if (isSpecialColor(color)) {
    ops.push(
      cachedDrawImage(
        resolveProperties(`Tails/${tailType}-Colors/${color}.webp`),
        imageFetcher
      )
    );
  } else {
    const colorFilters = applyColorFilters(baseColorDetails, color);
    const accentColorFilters = applyColorFilters(accentColorDetails, color);
    ops.push(
      await composeWithCanvas(
        cachedDrawImage(
          resolveProperties(`Tails/${tailType}-Colors/${tailType}-Base.webp`),
          imageFetcher
        ),
        ...colorFilters
      ),
      await composeWithCanvas(
        cachedDrawImage(
          resolveProperties(`Tails/${tailType}-Colors/${tailType}-Accent.webp`),
          imageFetcher
        ),
        ...accentColorFilters
      )
    );
  }

  ops.push(
    cachedDrawImage(resolveProperties(`Tails/${tailType}.webp`), imageFetcher)
  );

  return [
    {
      draw: await composeWithCanvas(...ops),
      zIndex: -1000,
    },
  ];
  // return [
  //   makeConditionalColorGenerator(
  //     {
  //       zIndex: -1000,
  //       baseColor: color,
  //       secondaryColor: splitColor,
  //       baseColorBasePath: `Tails/${tailType}-Colors`,
  //       secondaryColorBasePath: `Tails/${tailType}-Colors`,
  //     },
  //     imageFetcher
  //   ),
  //   {
  // draw: cachedDrawImage(
  //   resolveProperties(`Tails/${tailType}.webp`),
  //   imageFetcher
  // ),
  // zIndex: -500,
  //   },
  // ];
}

export function makeOutlineLayer(imageFetcher: IImageFetcher) {
  return {
    draw: cachedDrawImage(resolveProperties("Base/Base.webp"), imageFetcher),
    zIndex: 1700,
  };
}

interface IEarsLayer extends IBaseLayer {
  frillType: IFrillType;
}
interface IMouthLayer {
  mouthType: IMouthType;
}
interface IFaceLayer {
  faceType: IFaceType;
}
interface IHeadLayer {
  headType: IHeadType;
  color: BaseColor;
  splitColor?: BaseColor;
}
type ISpecialLayer = {
  specialType: ISpecialType;
} & IEarsLayer &
  IMouthLayer &
  IFaceLayer &
  IHeadLayer;
export async function makeSpecialOrHeadThingsLayer(
  {
    color,
    faceType,
    frillType,
    mouthType,
    headType,
    specialType,
    splitColor,
  }: ISpecialLayer,
  imageFetcher: IImageFetcher
) {
  if (specialType === "None") {
    return [
      ...(await makeEarsLayer(
        {
          color,
          frillType,
          splitColor,
        },
        imageFetcher
      )),
      makeMouthLayer(
        {
          mouthType,
        },
        imageFetcher
      ),
      makeEyeLayer(
        {
          faceType,
        },
        imageFetcher
      ),
      makeHeadLayer(
        {
          color,
          splitColor,
          headType,
        },
        imageFetcher
      ),
    ];
  }
  if (specialType === "TV Head") {
    return [
      {
        draw: cachedDrawImage(
          resolveProperties(`Special/${specialType}.webp`),
          imageFetcher
        ),
        zIndex: 1000000000,
      },
    ];
  }
  return [
    {
      draw: cachedDrawImage(
        resolveProperties(`Special/${specialType}.webp`),
        imageFetcher
      ),
      zIndex: 1000000000,
    },
    ...(await makeEarsLayer(
      {
        color,
        frillType,
        splitColor,
      },
      imageFetcher
    )),
  ];
}

async function makeEarsLayer(
  { color, splitColor, frillType }: IEarsLayer,
  imageFetcher: IImageFetcher
) {
  const ops: ILayer["draw"][] = [];
  if (isSpecialColor(color)) {
    ops.push(
      cachedDrawImage(
        resolveProperties(`Ears/${frillType}-Colors/Base/${color}.webp`),
        imageFetcher
      )
    );
  } else {
    const colorFilters = applyColorFilters(baseColorDetails, color);
    const accentColorFilters = applyColorFilters(accentColorDetails, color);
    ops.push(
      await composeWithCanvas(
        cachedDrawImage(
          resolveProperties(`Ears/${frillType}-Colors/${frillType}-Base.webp`),
          imageFetcher
        ),
        ...colorFilters
      ),
      await composeWithCanvas(
        cachedDrawImage(
          resolveProperties(
            `Ears/${frillType}-Colors/${frillType}-Accent.webp`
          ),
          imageFetcher
        ),
        ...accentColorFilters
      )
    );
  }
  if (splitColor) {
    if (isSpecialColor(splitColor)) {
      ops.push(
        cachedDrawImage(
          resolveProperties(`Ears/${frillType}-Colors/Base/${splitColor}.webp`),
          imageFetcher
        )
      );
    } else {
      const colorFilters = applyColorFilters(baseColorDetails, splitColor);
      const accentColorFilters = applyColorFilters(
        accentColorDetails,
        splitColor
      );
      ops.push(
        await composeWithCanvas(
          cachedDrawImage(
            resolveProperties(
              `Ears/${frillType}-Colors/${frillType}-Base-Split.webp`
            ),
            imageFetcher
          ),
          ...colorFilters
        ),
        await composeWithCanvas(
          cachedDrawImage(
            resolveProperties(
              `Ears/${frillType}-Colors/${frillType}-Accent-Split.webp`
            ),
            imageFetcher
          ),
          ...accentColorFilters
        )
      );
    }
  }
  ops.push(
    cachedDrawImage(resolveProperties(`Ears/${frillType}.webp`), imageFetcher)
  );
  return [
    {
      draw: await composeWithCanvas(...ops),
      zIndex: 1500,
    },
  ];
}

function makeMouthLayer(
  { mouthType }: IMouthLayer,
  imageFetcher: IImageFetcher
) {
  return {
    draw: cachedDrawImage(
      resolveProperties(`Mouths/${mouthType}.webp`),
      imageFetcher
    ),
    zIndex: 9999990,
  };
}

function makeEyeLayer({ faceType }: IFaceLayer, imageFetcher: IImageFetcher) {
  return {
    draw: cachedDrawImage(
      resolveProperties(`Eyes/${faceType}.webp`),
      imageFetcher
    ),
    zIndex: 10000000,
  };
}

function makeHeadLayer(
  { headType, color, splitColor }: IHeadLayer,
  imageFetcher: IImageFetcher
) {
  let drawOp: ILayer["draw"];

  if (["Side", "Tuft"].includes(headType)) {
    drawOp = composeDrawOps(
      cachedDrawImage(
        resolveProperties(`Head/${headType}-Color/${splitColor || color}.webp`),
        imageFetcher
      ),
      cachedDrawImage(resolveProperties(`Head/${headType}.webp`), imageFetcher)
    );
  } else {
    drawOp = cachedDrawImage(
      resolveProperties(`Head/${headType}.webp`),
      imageFetcher
    );
  }

  return {
    draw: drawOp,
    zIndex: 10000005,
  };
}

interface IArmsLayer {
  armType: IArmType;
  color: BaseColor;
  splitColor?: BaseColor;
}
export async function makeArmsLayer(
  { armType, color, splitColor }: IArmsLayer,
  imageFetcher: IImageFetcher
): Promise<ILayer[]> {
  const ops: ILayer["draw"][] = [];
  if (isSpecialColor(color)) {
    ops.push(
      cachedDrawImage(
        resolveProperties(`Arms/${armType}-Colors/Base/${color}.webp`),
        imageFetcher
      )
    );
  } else {
    ops.push(
      await composeWithCanvas(
        cachedDrawImage(
          resolveProperties(`Arms/${armType}-Colors/${armType}-Base.webp`),
          imageFetcher
        ),
        ...applyColorFilters(baseColorDetails, color)
      )
    );
    if (splitColor) {
      const splitColorFilters = applyColorFilters(baseColorDetails, splitColor);
      ops.push(
        await composeWithCanvas(
          cachedDrawImage(
            resolveProperties(`Arms/${armType}-Colors/${armType}-Split.webp`),
            imageFetcher
          ),
          ...splitColorFilters
        )
      );
    }
  }

  return [
    {
      draw: composeDrawOps(
        await composeWithCanvas(...ops),
        cachedDrawImage(resolveProperties(`Arms/${armType}.webp`), imageFetcher)
      ),
      zIndex: 1000105,
    },
  ];
}
interface IAccessoriesLayer {
  accessoryType: IAccessoriesType;
  color: HoodieColor;
}
export async function makeAccessoriesLayer(
  { accessoryType, color }: IAccessoriesLayer,
  imageFetcher: IImageFetcher
) {
  const ops: ILayer[] = [];
  if (accessoryType === "Flamingo") {
    ops.push({
      draw: cachedDrawImage(
        resolveProperties(`Accessories/${accessoryType}B.webp`),
        imageFetcher
      ),
      zIndex: 50000,
    });
    ops.push({
      draw: cachedDrawImage(
        resolveProperties(`Accessories/${accessoryType}T.webp`),
        imageFetcher
      ),
      zIndex: 1000500,
    });
  } else if (accessoryType === "Hoodie") {
    ops.push({
      draw: await composeWithCanvas(
        cachedDrawImage(
          resolveProperties(`Accessories/HoodieBase.webp`),
          imageFetcher
        ),
        ...applyColorFilters(hoodieBaseDetails, color)
      ),
      zIndex: 1000000,
    });
    ops.push({
      draw: await composeWithCanvas(
        cachedDrawImage(
          resolveProperties(`Accessories/HoodieLine.webp`),
          imageFetcher
        )
      ),
      zIndex: 1000030,
    });
    ops.push({
      draw: await composeWithCanvas(
        cachedDrawImage(
          resolveProperties(`Accessories/SleevesColor.webp`),
          imageFetcher
        ),
        ...applyColorFilters(hoodieBaseDetails, color)
      ),
      zIndex: 1000500,
    });
    ops.push({
      draw: await composeWithCanvas(
        cachedDrawImage(
          resolveProperties(`Accessories/HoodieAccent.webp`),
          imageFetcher
        ),
        ...applyColorFilters(hoodieAccentDetails, color)
      ),
      zIndex: 1000020,
    });
    ops.push({
      draw: await composeWithCanvas(
        cachedDrawImage(
          resolveProperties(`Accessories/SleevesLine.webp`),
          imageFetcher
        )
      ),
      zIndex: 1000530,
    });
  } else if (accessoryType !== "None") {
    ops.push({
      draw: cachedDrawImage(
        resolveProperties(`Accessories/${accessoryType}.webp`),
        imageFetcher
      ),
      zIndex: 1000500,
    });
  }
  return ops;
}
