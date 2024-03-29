import { GetObjectCommand, S3 } from "@aws-sdk/client-s3";
import { Canvas, Image } from "canvas";
import { generateAxolotlValleyFromSeed, renderCanvas } from "@0xflick/assets";
import { utils } from "ethers";
import type { Readable } from "stream";
import { APIGatewayProxyHandler } from "aws-lambda";

const s3 = new S3({
  region: "us-east-1",
});

if (!process.env.ASSET_BUCKET) {
  throw new Error("ASSET_BUCKET not set");
}
if (!process.env.SEED_BUCKET) {
  throw new Error("SEED_BUCKET not set");
}
if (!process.env.IMAGE_HOST) {
  throw new Error("IMAGE_HOST not set");
}
const generativeAssetsBucket = process.env.ASSET_BUCKET;
const seedImageBucket = process.env.SEED_BUCKET;
const imageHost = process.env.IMAGE_HOST;

async function s3Exists({
  key,
  bucket,
}: {
  key: string;
  bucket: string;
}): Promise<boolean> {
  const params = {
    Bucket: bucket,
    Key: key,
  };
  try {
    await s3.headObject(params);
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
  console.log(`Writing to s3://${seedImageBucket}/${key}`);
  const params = {
    Bucket: seedImageBucket,
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
  console.log("Received image request");
  try {
    if (event.httpMethod !== "GET") {
      return {
        statusCode: 405,
        body: "Method Not Allowed",
      };
    }
    const { pathParameters } = event;

    const seedStr = pathParameters.seed;
    console.log(`Seed: ${seedStr}`);

    const s3Key = `axolotl/${seedStr}.png`;
    const exists = await s3Exists({ key: s3Key, bucket: seedImageBucket });

    if (!exists) {
      console.log(`Seed image not found in S3: ${s3Key}`);
      // From seed, generate layers
      const { layers } = await generateAxolotlValleyFromSeed(
        utils.arrayify(seedStr),
        async (imagePath) => {
          console.log(
            `Fetching image from s3://${generativeAssetsBucket}/${imagePath}`
          );
          const getObjectCommand = new GetObjectCommand({
            Bucket: generativeAssetsBucket,
            Key: imagePath,
          });

          try {
            const response = await s3.send(getObjectCommand);
            console.log(
              `Reading buffer from s3://${generativeAssetsBucket}/${imagePath}`
            );
            const stream = response.Body as Readable;
            return new Promise<Image>((resolve, reject) => {
              const img = new Image();
              const responseDataChunks: Buffer[] = [];

              // Handle an error while streaming the response body
              stream.once("error", (err) => reject(err));

              // Attach a 'data' listener to add the chunks of data to our array
              // Each chunk is a Buffer instance
              stream.on("data", (chunk) => responseDataChunks.push(chunk));

              // Once the stream has no more data, join the chunks into a string and return the string
              stream.once("end", () => {
                console.log(
                  `Finished reading buffer from s3://${generativeAssetsBucket}/${imagePath}`
                );
                img.onload = () => {
                  console.log(
                    `Image loaded from s3://${generativeAssetsBucket}/${imagePath}`
                  );
                  resolve(img);
                };
                img.onerror = (err) => reject(err);
                img.src = Buffer.concat(responseDataChunks);
              });
            });
          } catch (err) {
            console.error(`Unable to fetch image ${imagePath}`, err);
            throw err;
          }
        }
      );

      // Render canvas
      console.log("Creating canvas");
      const canvas = new Canvas(569, 569);
      console.log("Rendering canvas");
      await renderCanvas(canvas, layers);

      // Save canvas to S3
      console.log("Fetching image from canvas");
      const imageData = canvas.toBuffer("image/png", { compressionLevel: 8 });
      console.log("Saving canvas to S3");
      await s3WriteObject(s3Key, imageData);
      console.log("Done");
      return {
        statusCode: 302,
        headers: {
          ["Location"]: `https://${imageHost}/${s3Key}`,
        },
        body: "",
      };
    }
    console.log(`Seed image found in S3: ${s3Key}`);
    console.log("Returning image");
    return {
      statusCode: 302,
      headers: {
        ["Location"]: `https://${imageHost}/${s3Key}`,
      },
      body: "",
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: "Oops, something went wrong",
    };
  }
};

process.on("uncaughtException", (err, origin) => {
  console.error(err, origin);
});
