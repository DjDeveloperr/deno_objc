// import sys from "./bindings.ts";
import { _handle } from "./util.ts";

export class Imp {
  [_handle]: Deno.UnsafePointer;

  constructor(handle: Deno.UnsafePointer) {
    this[_handle] = handle;
  }
}
