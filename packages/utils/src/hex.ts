export function hexString(value: string): `0x${string}` {
  if (!value.startsWith("0x")) {
    throw new Error(`Invalid hex string: ${value}`);
  }
  return value as `0x${string}`;
}
