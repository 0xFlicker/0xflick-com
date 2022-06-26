import type {
  CloudFrontResponseCallback,
  CloudFrontResponseEvent,
} from "aws-lambda";
import AWS from "aws-sdk";
import {
  CID,
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
  ssm.getParameter({ Name: "/edge/IpfsOriginBucket" }).promise(),
  ssm.getParameter({ Name: "/edge/IpfsOriginIPFSApiAuth" }).promise(),
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
  try {
    if ("origin" in request.headers && isAllowed(request.headers.origin)) {
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
      let request = event.Records[0].cf.request;

      // read the required path. Ex: uri /QM234234234/image.png
      let path = request.uri;

      // read the S3 key from the path variable.
      // Ex: path variable QM234234234/image.png
      let key = path.substring(1);

      // Check if the image does not exist in S3
      let buffer: Buffer;
      if (!(await s3Exists(key))) {
        // Check if the key is a CID
        const cid = CID.asCID(key);
        if (!cid) {
          console.log("not a CID ", key);
          response.status = "404";
          return callback(null, response);
        }
        console.log("CID found:", cid.toString());

        buffer = await loadIpfsContent(ipfsClient, key);
        // Cache the image in S3
        await S3.putObject({
          Body: buffer,
          Bucket: BUCKET,
          ContentType: "application/octet-stream",
          CacheControl: "max-age=31536000",
          Key: key,
          StorageClass: "STANDARD",
        }).promise();
      } else {
        // Fetch from S3
        console.log("Fetching from S3");
        const response = await S3.getObject({
          Bucket: BUCKET,
          Key: key,
        }).promise();
        buffer = response.Body as Buffer;
      }

      // generate a binary response
      return callback(null, {
        status: "200",
        body: buffer.toString("base64"),
        bodyEncoding: "base64",
        headers: {
          ...response.headers,
          "content-type": [
            { key: "Content-Type", value: "application/octet-stream" },
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
