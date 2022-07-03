import sys from "./bindings.ts";
import { _handle } from "./util.ts";

/** Represents an instance variable on class */
export class Ivar {
  [_handle]: bigint;

  constructor(handle: bigint) {
    this[_handle] = handle;
  }

  get name() {
    const ptr = sys.ivar_getName(this[_handle]);
    const ptrView = new Deno.UnsafePointerView(ptr);
    return ptrView.getCString();
  }

  get offset() {
    return sys.ivar_getOffset(this[_handle]);
  }

  get typeEncoding() {
    const ptr = sys.ivar_getTypeEncoding(this[_handle]);
    const ptrView = new Deno.UnsafePointerView(ptr);
    return ptrView.getCString();
  }

  [Symbol.for("Deno.customInspect")]() {
    return `[ivar ${this.name} (0x${
      this.offset.toString(16).padStart(2, "0")
    })]`;
  }
}
