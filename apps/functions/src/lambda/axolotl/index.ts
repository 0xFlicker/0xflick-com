import { S3 } from "@aws-sdk/client-s3";
import { Canvas } from "canvas";
import { generateAxolotlValleyFromSeed, renderCanvas } from "@0xflick/assets";
import { IERC721A } from "@0xflick/contracts";
import { utils, providers } from "ethers";
import { CloudFrontResponseEvent } from "aws-lambda";

const network = networkStringToNetworkType(process.env.NETWORK);
const provider = defaultProvider(network);

const creatureContract = ChildCreatureERC721__factory.connect(
  process.env.CHILD_CREATURE_ERC721_ADDRESS,
  provider
);
const s3 = new S3({});

/**
 *
 * @param key {string}
 * @returns {Promise<boolean>}
 */
async function s3Exists(key: string): Promise<boolean> {
  const params = {
    Bucket: process.env.ASSET_BUCKET,
    Key: key,
  };
  try {
    const data = await s3.headObject(params);
    return true;
  } catch (err) {
    return false;
  }
}

/**
 *
 * @param key {string}
 * @param imageData {Buffer}
 * @returns {Promise<void>}
 */
async function s3WriteObject(key: string, imageData: Buffer): Promise<void> {
  const params = {
    Bucket: process.env.ASSET_BUCKET,
    Key: key,
    Body: imageData,
    ACL: "public-read",
    ContentDisposition: "inline",
    ContentType: "image/png",
  };
  await s3.putObject(params);
}

// Handler
export async function handler(event: CloudFrontResponseEvent) {
  const request = event.Records[0].cf.request;
  const headers = request.headers;

  const params = new URLSearchParams(request.querystring);
  const tokenIdStr = params.get("tokenId");

  const tokenId = parseInt(tokenIdStr);
  if (!Number.isInteger(tokenId)) {
    return {
      statusCode: 400,
      body: "Token ID must be an integer",
    };
  }
  if (tokenId < 0) {
    return {
      statusCode: 400,
      body: "Token ID must be greater than 0",
    };
  }

  const tokenCount = await creatureContract.tokenCount();
  if (tokenCount.lt(tokenId)) {
    return {
      statusCode: 400,
      body: `Token ID must be less than ${tokenCount.toString()}`,
    };
  }
  const seed = await creatureContract.seed(tokenId);
  const s3Key = `seed/${seed}.png`;
  const exists = await s3Exists(s3Key);

  if (!exists) {
    // From seed, generate layers
    const { layers } = generateAxolotlValleyFromSeed(utils.arrayify(seed));

    // Render canvas
    const canvas = new Canvas(569, 569);
    await renderCanvas(canvas, layers);

    // Save canvas to S3
    const imageData = canvas.toBuffer();
    await s3WriteObject(s3Key, imageData);
  }

  return {
    statusCode: 301,
    headers: {
      Location: `${process.env.ASSET_URL}/${s3Key}`,
    },
  };
}
