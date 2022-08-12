import { S3 } from "@aws-sdk/client-s3";
import { Canvas, Image } from "canvas";
import { generateAxolotlValleyFromSeed, renderCanvas } from "@0xflick/assets";
import { utils } from "ethers";
import type { Readable } from "stream";
import { APIGatewayProxyHandler } from "aws-lambda";
import { SSM } from "@aws-sdk/client-ssm";

const ssm = new SSM({
  region: "us-east-1",
});

const s3 = new S3({
  region: "us-east-1",
});

const params = Promise.all([
  ssm
    .getParameter({ Name: "/edge/PublicNextPage" })
    .then((r) => r.Parameter?.Value),
  ,
]);

const [publicNextPage] = await params;
/**
 *
 * @param key {string}
 * @returns {Promise<boolean>}
 */
async function s3Exists(key: string): Promise<boolean> {
  const params = {
    Bucket: publicNextPage,
    Key: key,
  };
  try {
    await s3.headObject(params);
    return true;
  } catch (err) {
    return false;
  }
}

function streamToBuffer(stream: Readable): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.once("end", () => resolve(Buffer.concat(chunks)));
    stream.once("error", reject);
  });
}

/**
 *
 * @param key {string}
 * @param imageData {Buffer}
 * @returns {Promise<void>}
 */
async function s3WriteObject(key: string, imageData: Buffer): Promise<void> {
  const params = {
    Bucket: publicNextPage,
    Key: key,
    Body: imageData,
    ACL: "public-read",
    ContentDisposition: "inline",
    ContentType: "image/png",
  };
  await s3.putObject(params);
}

// Handler
export const handler: APIGatewayProxyHandler = async (event) => {
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    };
  }
  const { pathParameters } = event;

  const seedStr = pathParameters.seed;

  const s3Key = `seed/${seedStr}.jpg`;
  const exists = await s3Exists(s3Key);

  if (!exists) {
    // From seed, generate layers
    const { layers } = await generateAxolotlValleyFromSeed(
      utils.arrayify(seedStr),
      async (imagePath) => {
        const response = await s3.getObject({
          Bucket: publicNextPage,
          Key: imagePath,
        });

        const img = new Image();
        img.src = response.Body as any;
        return img as any;
      }
    );

    // Render canvas
    const canvas = new Canvas(569, 569);
    await renderCanvas(canvas, layers);

    // Save canvas to S3
    const imageData = canvas.toBuffer("image/jpeg", { quality: 0.8 });
    await s3WriteObject(s3Key, imageData);
    return {
      statusCode: 200,
      body: imageData.toString("base64"),
      bodyEncoding: "base64",
      headers: {
        ["content-type"]: "image/jpeg",
      },
    };
  }

  const response = await s3.getObject({
    Bucket: publicNextPage,
    Key: s3Key,
  });
  if (!response.Body) {
    return {
      statusCode: 500,
      body: "Internal Server Error",
    };
  }
  return {
    statusCode: 200,
    body: (await streamToBuffer(response.Body as Readable)).toString("base64"),
    bodyEncoding: "base64",
    headers: {
      ["content-type"]: "image/jpeg",
    },
  };
};
