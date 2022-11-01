// import sys from "./bindings.ts";
import { _handle } from "./util.ts";

/** Objective-C class method Implementation */
export class Imp {
  [_handle]: Deno.PointerValue;

  constructor(handle: Deno.PointerValue) {
    this[_handle] = handle;
  }
}
