export const _handle = Symbol("[[objc_handle]]");

export function toCString(str: string) {
  const encoded = new TextEncoder().encode(str);
  const buffer = new Uint8Array(encoded.byteLength + 1);
  buffer.set(encoded);
  return buffer;
}

export function isArrayBufferView(obj: any): obj is ArrayBufferView {
  return obj instanceof Uint8Array ||
    obj instanceof Uint16Array ||
    obj instanceof Uint32Array ||
    obj instanceof Uint8ClampedArray ||
    obj instanceof Int8Array ||
    obj instanceof Int16Array ||
    obj instanceof Int32Array ||
    obj instanceof Float32Array ||
    obj instanceof Float64Array ||
    obj instanceof BigUint64Array ||
    obj instanceof BigInt64Array;
}
