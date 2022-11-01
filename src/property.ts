import sys from "./bindings.ts";
import { _handle, toCString } from "./util.ts";

export interface PropertyAttribute {
  name: string;
  value: string;
}

export class Property {
  [_handle]: Deno.PointerValue;

  constructor(handle: Deno.PointerValue) {
    this[_handle] = handle;
  }

  get name() {
    const ptr = sys.property_getName(this[_handle]);
    return Deno.UnsafePointerView.getCString(ptr);
  }

  get attributes() {
    const ptr = sys.property_getAttributes(this[_handle]);
    if (ptr === 0) return undefined;
    return Deno.UnsafePointerView.getCString(ptr);
  }

  getAttributeList() {
    const outCount = new Uint32Array(1);
    const ptr = sys.property_copyAttributeList(this[_handle], outCount);
    if (ptr === 0) return undefined;
    const ptrView = new Deno.UnsafePointerView(BigInt(ptr));
    const attributes = new Array<PropertyAttribute>(outCount[0]);
    for (let i = 0; i < outCount[0]; i++) {
      const name = ptrView.getBigUint64(i * 16);
      const value = ptrView.getBigUint64(i * 16 + 8);
      attributes[i] = {
        name: Deno.UnsafePointerView.getCString(name),
        value: Deno.UnsafePointerView.getCString(value),
      };
    }
    return attributes;
  }

  getAttributeValue(name: string) {
    const ptr = sys.property_copyAttributeValue(this[_handle], toCString(name));
    if (ptr === 0) return undefined;
    return Deno.UnsafePointerView.getCString(ptr);
  }

  [Symbol.for("Deno.customInspect")]() {
    return `[property ${this.name}]`;
  }
}
