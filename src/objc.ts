import sys from "./bindings.ts";
import { Class } from "./class.ts";
import {
  CTypeInfo,
  fromNative,
  parseCType,
  toNative,
  toNativeType,
} from "./encoding.ts";
import { CObject } from "./object.ts";
import { Sel } from "./sel.ts";
import { _handle, toCString } from "./util.ts";

export class ObjC {
  static readonly classes: Record<string, Class> = new Proxy({}, {
    get: (_, name) => {
      if (typeof name === "symbol") return;
      return ObjC.getClass(name);
    },
  });

  static get classCount() {
    return sys.objc_getClassList(null, 0);
  }

  static get classList() {
    const outCount = new Uint32Array(1);
    const classPtrs = new Deno.UnsafePointerView(
      sys.objc_copyClassList(outCount),
    );
    const classes = new Array<Class>(outCount[0]);
    for (let i = 0; i < outCount[0]; i++) {
      const ptr = new Deno.UnsafePointer(classPtrs.getBigUint64(i * 8));
      classes[i] = new Class(ptr);
    }
    return classes;
  }

  static getClass(name: string): Class | undefined {
    const nameCstr = toCString(name);
    const classPtr = sys.objc_getClass(nameCstr);
    if (classPtr.value === 0n) return undefined;
    return new Class(classPtr);
  }

  // static get imageNames() {
  //   const outCount = new Uint32Array(1);
  //   const imageNames = new Array<string>();
  //   const imagePtrs = new Deno.UnsafePointerView(
  //     sys.objc_copyImageNames(outCount),
  //   );
  //   for (let i = 0; i < outCount[0]; i++) {
  //     const ptr = new Deno.UnsafePointer(imagePtrs.getBigUint64(i * 8));
  //     imageNames.push(new Deno.UnsafePointerView(ptr).getCString());
  //   }
  //   return imageNames;
  // }

  static msgSend<T = any>(
    obj: Class | CObject,
    selector: string | Deno.UnsafePointer,
    ...args: any[]
  ): T {
    const sel = new Sel(selector);
    const objptr = obj instanceof Deno.UnsafePointer ? obj : obj[_handle];
    const objclass = new Class(objptr);

    const method = obj instanceof Class
      ? objclass.getClassMethod(sel)
      : objclass.getInstanceMethod(sel);
    if (!method) {
      throw new Error(`${objclass.name} does not respond to ${sel.name}`);
    }

    const argc = method.argumentCount;
    if ((args.length + 2) !== argc) {
      throw new Error(
        `${objclass.name} ${sel.name} expects ${
          argc - 2
        } arguments, but got ${args.length}`,
      );
    }

    const argDefs: CTypeInfo[] = [];
    const retDef = parseCType(method.returnType);

    for (let i = 0; i < argc; i++) {
      const arg = method.getArgumentType(i);
      argDefs.push(parseCType(arg));
    }

    const argDefsNative = argDefs.map(toNativeType);
    const retDefNative = toNativeType(retDef);

    const fn = new Deno.UnsafeFnPointer(
      sys.objc_msgSend,
      {
        parameters: argDefsNative,
        result: retDefNative,
      } as const,
    );

    const cargs = [
      obj instanceof Deno.UnsafePointer ? obj : obj[_handle],
      sel[_handle],
      ...args.map((e, i) => toNative(argDefs[i + 2], e)),
    ];

    console.log(objclass.name, sel.name, argDefs, retDef, fn.definition, cargs);

    return fromNative(retDef, (fn.call as any)(...cargs));
  }
}

export default ObjC;
