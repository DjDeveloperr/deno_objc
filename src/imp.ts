// import sys from "./bindings.ts";
import { _handle } from "./util.ts";

/** Objective-C class method Implementation */
export class Imp {
  [_handle]: bigint;

  constructor(handle: bigint) {
    this[_handle] = handle;
  }
}
