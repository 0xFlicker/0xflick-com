export function authMessage(nonce: string) {
  return `
Sign this message to log into ${process.env.NEXT_PUBLIC_APP_NAME}

This operation costs no gas and is only used to verify that you are the owner of the private key for this address.

The following information is used by the server, to make this message good for one time only.

Nonce: ${nonce}
`;
}
