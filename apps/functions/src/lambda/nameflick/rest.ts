import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { IResolverService__factory } from "@0xflick/contracts";
import { abi as Resolver_abi } from "@ensdomains/ens-contracts/artifacts/contracts/resolvers/Resolver.sol/Resolver.json";

import { utils } from "ethers";
import { RPCCall } from "./types.js";
import { queryHandlers } from "./query.js";
import { PRIVATE_KEY } from "./config.js";

const CORS_HEADERS = {
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
};
const Resolver = new utils.Interface(Resolver_abi);

const resolveInterface = IResolverService__factory.createInterface();
const resolveFn = resolveInterface.getFunction("resolve");
const resolveSigHash = resolveInterface.getSighash("resolve");

function decodeDnsName(dnsname: Buffer) {
  const labels = [];
  let idx = 0;
  while (true) {
    const len = dnsname.readUInt8(idx);
    if (len === 0) break;
    labels.push(dnsname.slice(idx + 1, idx + len + 1).toString("utf8"));
    idx += len + 1;
  }
  return labels.join(".");
}

async function query(
  name: string,
  data: string
): Promise<{ result: utils.BytesLike; validUntil: number }> {
  // Parse the data nested inside the second argument to `resolve`
  const { signature, args } = Resolver.parseTransaction({ data });

  if (utils.nameprep(name) !== name) {
    throw new Error("Name must be normalised");
  }

  if (utils.namehash(name) !== args[0]) {
    throw new Error("Name does not match namehash");
  }
  console.log(`Query for ${name}`);
  const handler = queryHandlers[signature];
  if (handler === undefined) {
    throw new Error(`Unsupported query function ${signature}`);
  }

  const response = await handler(name, args.slice(1));
  const { result, ttl } = response;
  console.log(`Result: ${JSON.stringify(response)}`);
  return {
    result: Resolver.encodeFunctionResult(signature, result),
    validUntil: Math.floor(Date.now() / 1000 + ttl),
  };
}

const resolver = async (
  [encodedName, data]: utils.Result,
  request: RPCCall
) => {
  const signer = new utils.SigningKey(PRIVATE_KEY);
  const name = decodeDnsName(Buffer.from(encodedName.slice(2), "hex"));
  // Query the database
  const { result, validUntil } = await query(name, data);

  // Hash and sign the response
  const messageHash = utils.solidityKeccak256(
    ["bytes", "address", "uint64", "bytes32", "bytes32"],
    [
      "0x1900",
      request?.to,
      validUntil,
      utils.keccak256(request?.data || "0x"),
      utils.keccak256(result),
    ]
  );
  const sig = signer.signDigest(messageHash);
  const sigData = utils.hexConcat([sig.r, sig._vs]);
  return [result, validUntil, sigData];
};

async function call(call: RPCCall): Promise<APIGatewayProxyResult> {
  const calldata = utils.hexlify(call.data);
  const selector = calldata.slice(0, 10).toLowerCase();

  // Find a function handler for this selector
  if (selector !== resolveSigHash) {
    console.log(`Unsupported selector ${selector}`);
    return {
      statusCode: 400,
      body: "Unsupported function",
      headers: {
        ...CORS_HEADERS,
      },
    };
  }

  // Decode function arguments
  const args = utils.defaultAbiCoder.decode(
    resolveFn.inputs,
    "0x" + calldata.slice(10)
  );

  // Call the handler
  const result = await resolver(args, call);

  // Encode return data
  return {
    statusCode: 200,
    headers: {
      ...CORS_HEADERS,
    },
    body: JSON.stringify({
      data: resolveFn.outputs
        ? utils.hexlify(utils.defaultAbiCoder.encode(resolveFn.outputs, result))
        : "0x",
    }),
  };
}

export async function handler(event: APIGatewayProxyEvent) {
  let sender: string;
  let callData: string;
  if (event.httpMethod === "POST" && event.body) {
    const body = JSON.parse(event.body);
    sender = body.sender;
    callData = body.data;
  } else if (
    event.httpMethod === "GET" &&
    event.pathParameters &&
    event.pathParameters.sender &&
    event.pathParameters.callData
  ) {
    sender = event.pathParameters.sender;
    callData = event.pathParameters.callData;
  } else {
    console.log(`Invalid request: ${event.httpMethod} ${event.path}`);
    return {
      statusCode: 400,
      body: "Invalid request",
      headers: {
        ...CORS_HEADERS,
      },
    };
  }

  if (!utils.isAddress(sender) || !utils.isBytesLike(callData)) {
    console.log(`Invalid request: ${sender} ${callData}`);
    return {
      statusCode: 400,
      body: "Invalid request",
      headers: {
        ...CORS_HEADERS,
      },
    };
  }

  try {
    return await call({ to: sender, data: callData });
  } catch (e) {
    console.error(e);
    return {
      statusCode: 500,
      body: "Internal server error",
      headers: {
        ...CORS_HEADERS,
      },
    };
  }
}
