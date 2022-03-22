export const _handle = Symbol("[[objc_handle]]");
export const _proxied = Symbol("[[objc_proxied]]");

export function toCString(str: string) {
  const buffer = new Uint8Array(str.length + 1);
  new TextEncoder().encodeInto(str, buffer);
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
