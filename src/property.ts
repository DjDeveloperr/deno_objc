import sys from "./bindings.ts";
import { _handle, toCString } from "./util.ts";

export interface PropertyAttribute {
  name: string;
  value: string;
}

export class Property {
  [_handle]: bigint;

  constructor(handle: bigint) {
    this[_handle] = handle;
  }

  get name() {
    const ptr = sys.property_getName(this[_handle]);
    const ptrView = new Deno.UnsafePointerView(ptr);
    return ptrView.getCString();
  }

  get attributes() {
    const ptr = sys.property_getAttributes(this[_handle]);
    if (ptr === 0n) return undefined;
    const ptrView = new Deno.UnsafePointerView(ptr);
    return ptrView.getCString();
  }

  getAttributeList() {
    const outCount = new Uint32Array(1);
    const ptr = sys.property_copyAttributeList(this[_handle], outCount);
    if (ptr === 0n) return undefined;
    const ptrView = new Deno.UnsafePointerView(ptr);
    const attributes = new Array<PropertyAttribute>(outCount[0]);
    for (let i = 0; i < outCount[0]; i++) {
      const name = ptrView.getBigUint64(i * 16);
      const value = ptrView.getBigUint64(i * 16 + 8);
      attributes[i] = {
        name: new Deno.UnsafePointerView(name).getCString(),
        value: new Deno.UnsafePointerView(value).getCString(),
      };
    }
    return attributes;
  }

  getAttributeValue(name: string) {
    const ptr = sys.property_copyAttributeValue(this[_handle], toCString(name));
    if (ptr === 0n) return undefined;
    const ptrView = new Deno.UnsafePointerView(ptr);
    return ptrView.getCString();
  }

  [Symbol.for("Deno.customInspect")]() {
    return `[property ${this.name}]`;
  }
}
