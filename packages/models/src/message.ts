export interface ISigningRequest {
  domain: string;
  address: string;
  uri: string;
  version: string;
  chainId: number;
  nonce: string;
  issuedAt: number;
  expirationTime: number;
}

export function authMessage({
  domain,
  address,
  uri,
  version,
  chainId,
  nonce,
  issuedAt,
  expirationTime,
}: ISigningRequest) {
  return `${domain} wants you to sign in with your Ethereum account:
${address}

This operation costs no gas and is only used to verify that you own this address.

URI: ${uri}
Version: ${version}
Chain ID: ${chainId}
Nonce: ${nonce}
Expiration Time: ${new Date(expirationTime).toISOString()}
Issued At: ${new Date(issuedAt).toISOString()}`;
}
