import sys from "./bindings.ts";
import { _handle, toCString } from "./util.ts";

export class Sel {
  [_handle]: Deno.UnsafePointer;

  constructor(handle: Deno.UnsafePointer) {
    this[_handle] = handle;
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
}
