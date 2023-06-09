import sys from "./bindings.ts";
import { _handle } from "./util.ts";

/** Represents an instance variable on class */
export class Ivar {
  [_handle]: Deno.PointerValue;

  constructor(handle: Deno.PointerValue) {
    this[_handle] = handle;
  }

  get name() {
    const ptr = sys.ivar_getName(this[_handle]);
    return Deno.UnsafePointerView.getCString(ptr!);
  }

  get offset() {
    return sys.ivar_getOffset(this[_handle]);
  }

  get typeEncoding() {
    const ptr = sys.ivar_getTypeEncoding(this[_handle]);
    return Deno.UnsafePointerView.getCString(ptr!);
  }

  [Symbol.for("Deno.customInspect")]() {
    return `[ivar ${this.name} (0x${
      this.offset.toString(16).padStart(2, "0")
    })]`;
  }
}
