import sys from "./bindings.ts";
import { _handle } from "./util.ts";

export class CObject {
  [_handle]: Deno.UnsafePointer;

  constructor(handle: Deno.UnsafePointer) {
    this[_handle] = handle;
  }

  get className() {
    const ptr = sys.object_getClassName(this[_handle]);
    const ptrView = new Deno.UnsafePointerView(ptr);
    return ptrView.getCString();
  }

  [Symbol.for("Deno.customInspect")]() {
    return `[cobject ${this.className}]`;
  }
}
