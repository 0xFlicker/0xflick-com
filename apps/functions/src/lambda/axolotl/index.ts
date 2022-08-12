import { GetObjectCommand, S3 } from "@aws-sdk/client-s3";
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
  ssm
    .getParameter({ Name: "/edge/AxolotlSeedBucket" })
    .then((r) => r.Parameter?.Value),
]);

const [generativeAssetsBucket, seedImageBucket] = await params;

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

    const s3Key = `seed/${seedStr}.jpg`;
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
      const imageData = canvas.toBuffer("image/jpeg", { quality: 0.8 });
      console.log("Saving canvas to S3");
      await s3WriteObject(s3Key, imageData);
      console.log("Done");
      return {
        statusCode: 200,
        body: imageData.toString("base64"),
        bodyEncoding: "base64",
        headers: {
          ["content-type"]: "image/jpeg",
        },
      };
    }
    console.log(`Seed image found in S3: ${s3Key}`);
    const response = await s3.getObject({
      Bucket: seedImageBucket,
      Key: s3Key,
    });

    if (!response.Body) {
      console.log("No body");
      return {
        statusCode: 500,
        body: "Internal Server Error",
      };
    }
    console.log("Returning image");
    return {
      statusCode: 200,
      body: (await streamToBuffer(response.Body as Readable)).toString(
        "base64"
      ),
      bodyEncoding: "base64",
      headers: {
        ["content-type"]: "image/jpeg",
      },
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
