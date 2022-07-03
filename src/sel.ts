import sys from "./bindings.ts";
import { _handle, toCString } from "./util.ts";

export class Sel {
  [_handle]: bigint;

  constructor(handle: bigint | string | Sel) {
    this[_handle] = typeof handle === "bigint"
      ? handle
      : handle instanceof Sel
      ? handle[_handle]
      : Sel.register(handle)[_handle];
  }

  static register(name: string) {
    const nameCstr = toCString(name);
    const handle = sys.sel_registerName(nameCstr);
    return new Sel(handle);
  }

  static getUid(name: string) {
    const nameCstr = toCString(name);
    return sys.sel_getUid(nameCstr);
  }

  get name() {
    const ptr = sys.sel_getName(this[_handle]);
    const ptrView = new Deno.UnsafePointerView(ptr);
    return ptrView.getCString();
  }

  equals(other: Sel) {
    return sys.sel_isEqual(this[_handle], other[_handle]);
  }

  [Symbol.for("Deno.customInspect")]() {
    return `[sel ${this.name}]`;
  }
}
