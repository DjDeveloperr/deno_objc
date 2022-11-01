import sys from "./bindings.ts";
import { Class } from "./class.ts";
import { _handle } from "./util.ts";

export class CObject {
  [_handle]: Deno.PointerValue;

  constructor(handle: Deno.PointerValue) {
    this[_handle] = handle;
  }

  get className() {
    const ptr = sys.object_getClassName(this[_handle]);
    return Deno.UnsafePointerView.getCString(ptr);
  }

  get class() {
    return new Class(sys.object_getClass(this[_handle]));
  }

  [Symbol.for("Deno.customInspect")]() {
    return `[cobject ${this.className}]`;
  }
}
