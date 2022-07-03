// import sys from "./bindings.ts";
import { _handle } from "./util.ts";

/** Objective-C class method Implementation */
export class Imp {
  [_handle]: Deno.UnsafePointer;

  constructor(handle: Deno.UnsafePointer) {
    this[_handle] = handle;
  }
}
