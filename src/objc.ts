import sys from "./bindings.ts";
import { Class } from "./class.ts";
import { prepare } from "./message.ts";
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

  static msgSend(
    obj: any,
    selector: string,
    ...args: any[]
  ): Deno.UnsafePointer {
    const { parameters, values } = prepare(args);
    const fn = new Deno.UnsafeFnPointer(
      sys.objc_msgSend,
      {
        parameters: ["pointer", "pointer", ...parameters],
        result: "pointer",
      } as const,
    );
    const cargs = [
      obj instanceof Deno.UnsafePointer ? obj : obj[_handle],
      Sel.register(selector)[_handle],
      ...values,
    ];
    return (fn.call as any)(...cargs) as Deno.UnsafePointer;
  }
}

export default ObjC;
