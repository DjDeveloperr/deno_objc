import sys from "./bindings.ts";
import { _handle } from "./util.ts";

export class Protocol {
  [_handle]: Deno.PointerValue;

  constructor(handle: Deno.PointerValue) {
    this[_handle] = handle;
  }

  get name() {
    const ptr = sys.protocol_getName(this[_handle]);
    return Deno.UnsafePointerView.getCString(ptr!);
  }

  [Symbol.for("Deno.customInspect")]() {
    return `[protocol ${this.name}]`;
  }
}
