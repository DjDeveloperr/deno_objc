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
import { _handle, _proxied, toCString } from "./util.ts";
import { fromFileUrl } from "../deps.ts";

function toJS(c: any) {
  if (c instanceof Class || c instanceof CObject) {
    return createProxy(c);
  } else {
    return c;
  }
}

export function createMethodProxy(self: Class | CObject, name: string) {
  return new Proxy(() => {}, {
    apply(_target, _self, args) {
      if (name.includes("_") && args.length > 0) {
        name = name.replaceAll("_", ":");
      }
      if (args.length > 0 && !name.endsWith(":")) {
        name += ":";
      }

      return toJS(ObjC.msgSend(self, name, ...args));
    },

    get(target: any, prop) {
      if (typeof prop === "symbol") {
        if (prop.description === "Deno.customInspect") {
          return () => {
            const objclass = self instanceof Class ? self : self.class;
            let sel = new Sel(name.replaceAll("_", ":"));
            let method = self instanceof Class
              ? objclass.getClassMethod(sel)
              : objclass.getInstanceMethod(sel);
            if (!method) {
              sel = new Sel(name.replaceAll("_", ":") + ":");
              method = self instanceof Class
                ? objclass.getClassMethod(sel)
                : objclass.getInstanceMethod(sel);
            }
            if (!method) return `[method nil]`;
            const parts = sel.name.split(":");
            let args = "";
            for (let i = 0; i < parts.length - 1; i++) {
              const part = parts[i];
              args += `${part}:${method.getArgumentType(i)} `;
            }
            return `${
              self instanceof Class
                ? `+ ${method.returnType} [${self.name}`
                : `- ${method.returnType} [${self.className}`
            } ${args.trim()}]`;
          };
        } else {
          return target[prop];
        }
      } else {
        return target[prop];
      }
    },

    has(_, p) {
      if (typeof p === "symbol" && p.description === "Deno.customInspect") {
        return true;
      } else {
        return false;
      }
    },
  });
}

export function createProxy(self: Class | CObject) {
  // const objclass = self instanceof Class ? self : self.class;
  const proxy: any = new Proxy(self, {
    get(target, prop) {
      if (typeof prop === "symbol") {
        if (prop === _proxied) {
          return self;
        } else if (prop.description === "Deno.customInspect") {
          return () => {
            try {
              const desc = proxy.description();
              return desc.UTF8String();
            } catch (_) {
              return self instanceof Class
                ? `[class ${self.name}]`
                : `[object ${self.className}]`;
            }
          };
        } else return (target as any)[prop];
      } else {
        return createMethodProxy(self, prop);
      }
    },
    set(_target, _prop, _value) {
      return false;
    },
    has(target, prop) {
      if (typeof prop === "symbol") {
        return prop in target;
      } else {
        return false;
      }
    },
  });
  return proxy;
}

export class ObjC {
  static readonly classes: Record<string, any> = new Proxy({}, {
    get: (_, name) => {
      if (typeof name === "symbol") return;
      const cls = ObjC.getClass(name);
      if (!cls) return;
      else return createProxy(cls);
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
    obj: any,
    selector: string | Deno.UnsafePointer | Sel,
    ...args: any[]
  ): T {
    const sel = new Sel(selector);
    if (obj[_proxied]) {
      obj = obj[_proxied];
    }
    const objptr = obj instanceof Deno.UnsafePointer ? obj : obj[_handle];
    const objclass = obj instanceof Class
      ? obj
      : new Class(sys.object_getClass(objptr));

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
      ...args.map((e, i) => {
        const def = argDefs[i + 2];
        if (typeof e === "string") {
          if (def.type === "id") {
            e = this.classes.NSString.stringWithUTF8String(e);
          } else if (def.type === "class") {
            e = this.classes[e];
          }
        }
        return toNative(def, e);
      }),
    ];

    return fromNative(retDef, (fn.call as any)(...cargs));
  }

  static import(path: string | URL) {
    if (path instanceof URL) {
      path = fromFileUrl(path);
    } else if (!path.startsWith("/")) {
      path = `/System/Library/Frameworks/${path}.framework`;
    }

    const { NSBundle } = this.classes;
    const bundle = NSBundle.bundleWithPath(path);

    if (!bundle) {
      throw new Error(`Could not load bundle at ${path}`);
    }
    if (!bundle.load()) {
      throw new Error(`Failed to load bundle at ${path}`);
    }
  }

  static [Symbol.for("Deno.customInspect")]() {
    return `ObjC { ${ObjC.classCount} classes }`;
  }

  static send(template: TemplateStringsArray, ...args: any[]) {
    return toJS(
      ObjC.msgSend(
        args[0],
        template.map((e) => e.trim()).join(""),
        ...args.slice(1),
      ),
    );
  }
}

export default ObjC;
