// deno-lint-ignore-file no-explicit-any
import { _handle, toCString } from "./util.ts";

export class Holder<T> {
  constructor(public v: T) {}
}

// We use these classes to infer types to create FFI definitions
// for objc_msgSend(Super).
export class U8 extends Holder<number> {}
export class U16 extends Holder<number> {}
export class U32 extends Holder<number> {}
export class U64 extends Holder<number> {}
export class I8 extends Holder<number> {}
export class I16 extends Holder<number> {}
export class I32 extends Holder<number> {}
export class I64 extends Holder<number> {}
export class F32 extends Holder<number> {}
export class F64 extends Holder<number> {}

export function prepare(args: any[]) {
  const parameters: Deno.NativeType[] = new Array(args.length).fill("void");
  const values: any[] = new Array(args.length).fill(null);

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg instanceof U8) {
      parameters[i] = "u8";
      values[i] = arg.v;
    } else if (arg instanceof U16) {
      parameters[i] = "u16";
      values[i] = arg.v;
    } else if (arg instanceof U32) {
      parameters[i] = "u32";
      values[i] = arg.v;
    } else if (arg instanceof U64) {
      parameters[i] = "u64";
      values[i] = arg.v;
    } else if (arg instanceof I8) {
      parameters[i] = "i8";
      values[i] = arg.v;
    } else if (arg instanceof I16) {
      parameters[i] = "i16";
      values[i] = arg.v;
    } else if (arg instanceof I32) {
      parameters[i] = "i32";
      values[i] = arg.v;
    } else if (arg instanceof I64) {
      parameters[i] = "i64";
      values[i] = arg.v;
    } else if (arg instanceof F32) {
      parameters[i] = "f32";
      values[i] = arg.v;
    } else if (arg instanceof F64) {
      parameters[i] = "f64";
      values[i] = arg.v;
    } else if (
      arg === null || arg instanceof Uint8Array || arg instanceof Uint16Array ||
      arg instanceof Uint32Array || arg instanceof BigUint64Array ||
      arg instanceof BigInt64Array ||
      arg instanceof Int8Array || arg instanceof Int16Array ||
      arg instanceof Int32Array ||
      arg instanceof BigInt64Array || arg instanceof BigUint64Array ||
      arg instanceof Float32Array ||
      arg instanceof Float64Array || arg instanceof Deno.UnsafePointer
    ) {
      parameters[i] = "pointer";
      values[i] = arg;
    } else if (typeof arg === "string") {
      parameters[i] = "pointer";
      values[i] = toCString(arg);
    } else if (typeof arg === "object" && _handle in arg) {
      parameters[i] = "pointer";
      values[i] = arg[_handle];
    } else {
      throw new Error(`Unsupported argument type: ${typeof arg}`);
    }
  }

  return { parameters, values };
}
