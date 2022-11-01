import sys from "./bindings.ts";
import { Imp } from "./imp.ts";
import { Sel } from "./sel.ts";
import { _handle } from "./util.ts";

/** Represents a class/instance method */
export class Method {
  [_handle]: Deno.PointerValue;

  constructor(handle: Deno.PointerValue) {
    this[_handle] = handle;
  }

  get name() {
    const ptr = sys.method_getName(this[_handle]);
    return new Sel(ptr);
  }

  get returnType() {
    const ptr = sys.method_copyReturnType(this[_handle]);
    const ptrView = new Deno.UnsafePointerView(ptr);
    return ptrView.getCString();
  }

  getArgumentType(index: number) {
    const ptr = sys.method_copyArgumentType(this[_handle], index);
    if (ptr === 0) return "";
    const ptrView = new Deno.UnsafePointerView(ptr);
    return ptrView.getCString();
  }

  get argumentCount() {
    return sys.method_getNumberOfArguments(this[_handle]);
  }

  get implementation() {
    const ptr = sys.method_getImplementation(this[_handle]);
    return new Imp(ptr);
  }

  [Symbol.for("Deno.customInspect")]() {
    return `[method ${this.name.name}] (${
      new Array(this.argumentCount).fill("").map((_, i) =>
        this.getArgumentType(i)
      ).join(", ")
    }) -> ${this.returnType}`;
  }
}
