import sys from "./bindings.ts";
import { Class } from "./class.ts";
import { _handle } from "./util.ts";

export class CObject {
  [_handle]: bigint;

  constructor(handle: bigint) {
    this[_handle] = handle;
  }

  get className() {
    const ptr = sys.object_getClassName(this[_handle]);
    const ptrView = new Deno.UnsafePointerView(ptr);
    return ptrView.getCString();
  }

  get class() {
    return new Class(sys.object_getClass(this[_handle]));
  }

  [Symbol.for("Deno.customInspect")]() {
    return `[cobject ${this.className}]`;
  }
}
