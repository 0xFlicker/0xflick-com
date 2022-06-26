import axios from "axios";
import { CID } from "multiformats/cid";
import type {
  CloudFrontResponseCallback,
  CloudFrontResponseEvent,
} from "aws-lambda";
import AWS from "aws-sdk";
import Sharp, { AvailableFormatInfo, FormatEnum } from "sharp";
import {
  create as createIpfsHttpClient,
  IPFSHTTPClient,
} from "ipfs-http-client";

const S3 = new AWS.S3({
  signatureVersion: "v4",
});

const ssm = new AWS.SSM({
  region: "us-east-1",
});

const cors = {
  allow: ["http://localhost:3000", "https://0xflick.com"],
  allowCredentials: true,
};

const [bucketResult, ipfsApiAuth] = await Promise.all([
  ssm.getParameter({ Name: "/edge/ImageOriginBucket" }).promise(),
  ssm.getParameter({ Name: "/edge/ImageOriginIPFSApiAuth" }).promise(),
]);

const BUCKET = bucketResult.Parameter?.Value;
const IPFS_AUTH = ipfsApiAuth.Parameter?.Value;

if (!BUCKET) {
  throw new Error("BUCKET is not set");
}
if (!IPFS_AUTH) {
  throw new Error("IPFS_AUTH is not set");
}

const IPFS_API = "ipfs.infura.io:5001";

const ipfsClient = createIpfsHttpClient({
  host: IPFS_API,
  protocol: "https",
  headers: {
    Authorization: IPFS_AUTH,
  },
});

const s3Exists = async (key: string) => {
  try {
    await S3.headObject({
      Bucket: BUCKET,
      Key: key,
    }).promise();
    return true;
  } catch (err) {
    return false;
  }
};

export async function loadIpfsContent(
  ipfsClient: IPFSHTTPClient,
  ipfsCid: string
) {
  const contents: Uint8Array[] = [];
  for await (let metadataBuf of ipfsClient.cat(ipfsCid)) {
    contents.push(metadataBuf);
  }
  return Buffer.concat(contents);
}

export const handler = async (
  event: CloudFrontResponseEvent,
  _: void,
  callback: CloudFrontResponseCallback
): Promise<void> => {
  const response = event.Records[0].cf.response;
  const request = event.Records[0].cf.request;

  console.log("Response status code :%s", response.status);
  console.log("Request headers", JSON.stringify(request.headers));
  try {
    if ("origin" in request.headers && isAllowed(request.headers.origin)) {
      console.log("Allowed origin:", request.headers.origin[0].value);
      response.headers["access-control-allow-origin"] = [
        {
          key: "Access-Control-Allow-Origin",
          value: request.headers.origin[0].value,
        },
      ];
      response.headers["access-control-allow-methods"] = [
        { key: "Access-Control-Allow-Methods", value: "GET, HEAD" },
      ];
      response.headers["access-control-max-age"] = [
        { key: "Access-Control-Max-Age", value: "86400" },
      ];
    }
    //check if image is not present
    if (Number(response.status) === 404 || Number(response.status) === 403) {
      console.log("Image not found");
      let request = event.Records[0].cf.request;

      // read the required path. Ex: uri /images/100x100/webp/image.jpg
      let path = request.uri;

      // read the S3 key from the path variable.
      // Ex: path variable /images/100x100/webp/image.jpg
      let key = path.substring(1);

      // parse the prefix, width, height and image name
      // Ex: key=images/200x200/webp/image.jpg
      let prefix, originalKey, match, imageName;
      let requiredFormat: string;
      let width: string, height: string;

      match = key.match(/(.*)\/(\d+|auto)x(\d+|auto)\/(.*)\/(.*)/);
      if (!match) {
        console.log(`Invalid key: ${key}`);
        return callback(null, response);
      }

      prefix = match[1];
      width = match[2];
      height = match[3];

      console.log(`prefix: ${prefix} width: ${width} height: ${height}`);
      // correction for jpg required for 'Sharp'
      requiredFormat = match[4] == "jpg" ? "jpeg" : match[4];
      imageName = match[5];
      originalKey = prefix + "/" + imageName;

      // Check if the image does not exist in S3
      let buffer: Buffer;
      if (!(await s3Exists(originalKey))) {
        // Check if the key is a CID
        // if (!CID.isCID(originalKey)) {
        //   response.status = "404";
        //   return callback(null, response);
        // }

        console.log("IPFS request: ", originalKey);
        buffer = await loadIpfsContent(ipfsClient, originalKey);
        // Cache the image in S3
        await S3.putObject({
          Body: buffer,
          Bucket: BUCKET,
          ContentType: "image/" + requiredFormat,
          CacheControl: "max-age=31536000",
          Key: originalKey,
          StorageClass: "STANDARD",
        }).promise();
      } else {
        // Fetch from S3
        console.log("Fetching from S3");
        const response = await S3.getObject({
          Bucket: BUCKET,
          Key: originalKey,
        }).promise();
        buffer = response.Body as Buffer;
      }
      buffer = await Sharp(buffer)
        .resize(
          width === "auto" ? null : Number(width),
          height === "auto" ? null : Number(height)
        )
        .toFormat(requiredFormat as keyof FormatEnum | AvailableFormatInfo)
        .toBuffer();
      // save the resized object to S3 bucket with appropriate object key.
      await S3.putObject({
        Body: buffer,
        Bucket: BUCKET,
        ContentType: "image/" + requiredFormat,
        CacheControl: "max-age=31536000",
        Key: key,
        StorageClass: "STANDARD",
      })
        .promise()
        // even if there is exception in saving the object we send back the generated
        // image back to viewer below
        .catch(() => {
          console.error("Exception while writing resized image to bucket");
        });

      // generate a binary response with resized image
      return callback(null, {
        status: "200",
        body: buffer.toString("base64"),
        bodyEncoding: "base64",
        headers: {
          ...response.headers,
          "content-type": [
            { key: "Content-Type", value: "image/" + requiredFormat },
          ],
        },
      });
    } // end of if block checking response statusCode
    else {
      // allow the response to pass through
      return callback(null, response);
    }
  } catch (err: any) {
    console.error(err);
    return callback(null, {
      status: "500",
      headers: {
        ...response.headers,
      },
      statusDescription: "Internal Server Error",
      body: JSON.stringify({
        error: err.message,
      }),
    });
  }
};

const isAllowed = (
  origin: {
    key?: string | undefined;
    value: string;
  }[]
) => {
  const o = origin[0].value;
  return (
    o == undefined ||
    cors.allow
      .map((ao) => ao == "*" || ao.indexOf(o) !== -1)
      .reduce((prev, current) => prev || current)
  );
};
