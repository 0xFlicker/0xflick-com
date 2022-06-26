export function stripIpfsProtocol(maybeIpfsProtocol: string) {
  const imgComponents = maybeIpfsProtocol.split("ipfs://");
  if (imgComponents.length > 0) {
    return imgComponents[1];
  }
  return maybeIpfsProtocol;
}
