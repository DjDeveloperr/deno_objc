import sys from "./bindings.ts";
import { _handle } from "./util.ts";

export class Protocol {
  [_handle]: bigint;

  constructor(handle: bigint) {
    this[_handle] = handle;
  }

  get name() {
    const ptr = sys.protocol_getName(this[_handle]);
    const ptrView = new Deno.UnsafePointerView(ptr);
    return ptrView.getCString();
  }

  [Symbol.for("Deno.customInspect")]() {
    return `[protocol ${this.name}]`;
  }
}
