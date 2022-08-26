import { S3 } from "@aws-sdk/client-s3";
import { APIGatewayProxyHandler } from "aws-lambda";
import { generateNameflick } from "@0xflick/assets";

const s3 = new S3({
  region: "us-east-1",
});

if (!process.env.BUCKET_NAME) {
  throw new Error("BUCKET_NAME env var not set");
}
const bucketName = process.env.BUCKET_NAME;

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
  console.log(`Writing to s3://${bucketName}/${key}`);
  const params = {
    Bucket: bucketName,
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

    const wrappedStr = pathParameters.wrapped;
    console.log(`Wrapped: ${wrappedStr}`);
    const tokenIdStr = pathParameters.tokenId;
    console.log(`TokenID: ${tokenIdStr}`);

    const s3Key = `nameflick/token_${tokenIdStr}/${encodeURIComponent(
      wrappedStr
    )}.png`;
    const exists = await s3Exists({ key: s3Key, bucket: bucketName });

    if (!exists) {
      console.log(`image not found in S3: ${s3Key}`);
      // From seed, generate layers
      const buffer = await generateNameflick(wrappedStr, Number(tokenIdStr));
      await s3WriteObject(s3Key, buffer);
      console.log("Done");
      return {
        statusCode: 302,
        headers: {
          ["Location"]: `https://image.0xflick.com/${s3Key}`,
        },
        body: "",
      };
    }
    console.log(`Image found in S3: ${s3Key}`);
    console.log("Returning image");
    return {
      statusCode: 302,
      headers: {
        ["Location"]: `https://image.0xflick.com/${s3Key}`,
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
