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
    draw: cachedDrawImage(resolveProperties(`${color}.PNG`), imageFetcher),
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
        resolveProperties(`${baseColorBasePath}/${baseColor}.PNG`),
        imageFetcher
      ),
      cachedDrawImage(
        resolveProperties(`${secondaryColorBasePath}/${secondaryColor}.PNG`),
        imageFetcher
      )
    );
  } else {
    drawOp = cachedDrawImage(
      resolveProperties(`${baseColorBasePath}/${baseColor}.PNG`),
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
          `${basePath}/${isSpecialColor ? color : baseColorPath}.PNG`
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
      resolveProperties(`${secondaryColorBasePath}/${secondaryColor}.PNG`),
      imageFetcher
    );
  } else {
    drawOp = cachedDrawImage(
      resolveProperties(`${baseColorBasePath}/${baseColor}.PNG`),
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

export function makeTailLayer(
  { color, splitColor, tailType }: ITailLayer,
  imageFetcher: IImageFetcher
) {
  return [
    makeConditionalColorGenerator(
      {
        zIndex: -1000,
        baseColor: color,
        secondaryColor: splitColor,
        baseColorBasePath: `Tails/${tailType}-Colors`,
        secondaryColorBasePath: `Tails/${tailType}-Colors`,
      },
      imageFetcher
    ),
    {
      draw: cachedDrawImage(
        resolveProperties(`Tails/${tailType}.PNG`),
        imageFetcher
      ),
      zIndex: -500,
    },
  ];
}

export function makeOutlineLayer(imageFetcher: IImageFetcher) {
  return {
    draw: cachedDrawImage(resolveProperties("Base/Base.PNG"), imageFetcher),
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
          resolveProperties(`Special/${specialType}.PNG`),
          imageFetcher
        ),
        zIndex: 1000000000,
      },
    ];
  }
  return [
    {
      draw: cachedDrawImage(
        resolveProperties(`Special/${specialType}.PNG`),
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
        resolveProperties(`Ears/${frillType}-Colors/Base/${color}.PNG`),
        imageFetcher
      )
    );
  } else {
    const colorFilters = applyColorFilters(baseColorDetails, color);
    const accentColorFilters = applyColorFilters(accentColorDetails, color);
    ops.push(
      await composeWithCanvas(
        cachedDrawImage(
          resolveProperties(`Ears/${frillType}-Colors/${frillType}-Base.PNG`),
          imageFetcher
        ),
        ...colorFilters
      ),
      await composeWithCanvas(
        cachedDrawImage(
          resolveProperties(`Ears/${frillType}-Colors/${frillType}-Accent.PNG`),
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
          resolveProperties(`Ears/${frillType}-Colors/Base/${splitColor}.PNG`),
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
              `Ears/${frillType}-Colors/${frillType}-Base-Split.PNG`
            ),
            imageFetcher
          ),
          ...colorFilters
        ),
        await composeWithCanvas(
          cachedDrawImage(
            resolveProperties(
              `Ears/${frillType}-Colors/${frillType}-Accent-Split.PNG`
            ),
            imageFetcher
          ),
          ...accentColorFilters
        )
      );
    }
  }
  ops.push(
    cachedDrawImage(resolveProperties(`Ears/${frillType}.PNG`), imageFetcher)
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
      resolveProperties(`Mouths/${mouthType}.PNG`),
      imageFetcher
    ),
    zIndex: 9999990,
  };
}

function makeEyeLayer({ faceType }: IFaceLayer, imageFetcher: IImageFetcher) {
  return {
    draw: cachedDrawImage(
      resolveProperties(`Eyes/${faceType}.PNG`),
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
        resolveProperties(`Head/${headType}-Color/${splitColor || color}.PNG`),
        imageFetcher
      ),
      cachedDrawImage(resolveProperties(`Head/${headType}.PNG`), imageFetcher)
    );
  } else {
    drawOp = cachedDrawImage(
      resolveProperties(`Head/${headType}.PNG`),
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
        resolveProperties(`Arms/${armType}-Colors/Base/${color}.PNG`),
        imageFetcher
      )
    );
  } else {
    ops.push(
      await composeWithCanvas(
        cachedDrawImage(
          resolveProperties(`Arms/${armType}-Colors/${armType}-Base.PNG`),
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
            resolveProperties(`Arms/${armType}-Colors/${armType}-Split.PNG`),
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
        cachedDrawImage(resolveProperties(`Arms/${armType}.PNG`), imageFetcher)
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
        resolveProperties(`Accessories/${accessoryType}B.PNG`),
        imageFetcher
      ),
      zIndex: 50000,
    });
    ops.push({
      draw: cachedDrawImage(
        resolveProperties(`Accessories/${accessoryType}T.PNG`),
        imageFetcher
      ),
      zIndex: 1000500,
    });
  } else if (accessoryType === "Hoodie") {
    ops.push({
      draw: await composeWithCanvas(
        cachedDrawImage(
          resolveProperties(`Accessories/HoodieBase.PNG`),
          imageFetcher
        ),
        ...applyColorFilters(hoodieBaseDetails, color)
      ),
      zIndex: 1000000,
    });
    ops.push({
      draw: await composeWithCanvas(
        cachedDrawImage(
          resolveProperties(`Accessories/HoodieLine.PNG`),
          imageFetcher
        )
      ),
      zIndex: 1000030,
    });
    ops.push({
      draw: await composeWithCanvas(
        cachedDrawImage(
          resolveProperties(`Accessories/SleevesColor.PNG`),
          imageFetcher
        ),
        ...applyColorFilters(hoodieBaseDetails, color)
      ),
      zIndex: 1000500,
    });
    ops.push({
      draw: await composeWithCanvas(
        cachedDrawImage(
          resolveProperties(`Accessories/HoodieAccent.PNG`),
          imageFetcher
        ),
        ...applyColorFilters(hoodieAccentDetails, color)
      ),
      zIndex: 1000020,
    });
    ops.push({
      draw: await composeWithCanvas(
        cachedDrawImage(
          resolveProperties(`Accessories/SleevesLine.PNG`),
          imageFetcher
        )
      ),
      zIndex: 1000530,
    });
  } else {
    ops.push({
      draw: cachedDrawImage(
        resolveProperties(`Accessories/${accessoryType}.PNG`),
        imageFetcher
      ),
      zIndex: 1000500,
    });
  }
  return ops;
}
