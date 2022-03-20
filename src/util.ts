export const _handle = Symbol("[[objc_handle]]");

export function toCString(str: string) {
  const encoded = new TextEncoder().encode(str);
  const buffer = new Uint8Array(encoded.byteLength + 1);
  buffer.set(encoded);
  return buffer;
}
