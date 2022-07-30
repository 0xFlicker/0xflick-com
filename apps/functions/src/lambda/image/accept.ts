import type {
  CloudFrontRequestEvent,
  CloudFrontRequestResult,
} from "aws-lambda";
import { createLogger } from "../../utils/logging.js";

// defines the allowed dimensions, default dimensions and how much variance from allowed
// dimension is allowed.

const variables = {
  defaultDimension: { w: 1000, h: "auto" },
  variance: 20,
  webpExtension: "webp",
};

const logger = createLogger();

export const handler = logger.handler(
  async (event: CloudFrontRequestEvent): Promise<CloudFrontRequestResult> => {
    const request = event.Records[0].cf.request;
    const headers = request.headers;

    // parse the querystrings key-value pairs. In our case it would be d=100x100
    const params = new URLSearchParams(request.querystring);

    // fetch the uri of original image
    let fwdUri = request.uri;

    // if there is no dimension attribute, just pass the request
    if (!params.get("w") && !params.get("h")) {
      return request;
    }
    // read the dimension parameter value = width x height and split it by 'x'
    const w = params.get("w");
    const widthAuto = w === null || w === "auto";

    const h = params.get("h");
    const heightAuto = h === null || h === "auto";

    // set the width and height parameters
    const width = widthAuto ? "auto" : w;
    const height = heightAuto ? "auto" : h;

    // parse the prefix, image name and extension from the uri.
    // In our case /images/image.jpg

    const match = fwdUri.match(/(.*)\/(.*)\/(.*)\.(.*)/);
    if (!match) {
      return request;
    }
    const type = match[1];
    const prefix = match[2];
    const imageName = match[3];
    const extension = match[4];

    console.log(
      `Fetching image ${prefix}/${imageName}.${extension} at ${width}x${height} of type ${type}`
    );
    // read the accept header to determine if webP is supported.
    const accept = headers["accept"] ? headers["accept"][0].value : "";

    const url = [type];
    // build the new uri to be forwarded upstream
    url.push(prefix);
    url.push(width + "x" + height);

    // check support for webp
    if (accept.includes(variables.webpExtension)) {
      url.push(variables.webpExtension);
    } else {
      url.push(extension);
    }
    url.push(imageName + "." + extension);

    fwdUri = url.join("/");

    // final modified url is of format /images/200x200/webp/image.jpg
    request.uri = fwdUri;
    return request;
  }
);
