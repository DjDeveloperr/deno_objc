import sys from "./bindings.ts";
import { Class, ClassCreateOptions } from "./class.ts";
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
import common from "./common.ts";
import { Protocol } from "./protocol.ts";
import { autoreleasepool } from "./autoreleasePool.ts";

function toJS(c: any) {
  if (c instanceof Class || c instanceof CObject) {
    return createProxy(c);
  } else {
    return c;
  }
}

/** Creates method proxy for an Objective-C class/instance method */
export function createMethodProxy(self: Class | CObject, name: string) {
  return new Proxy(() => {}, {
    apply(_target, _self, args) {
      if (name.includes("_") && args.length > 0) {
        name = name.replaceAll("_", ":");
      }
      if (args.length > 0 && !name.endsWith(":")) {
        name += ":";
      }

      return ObjC.msgSend(self, name, ...args);
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
            for (let i = 0; i < parts.length; i++) {
              const part = parts[i].trim();
              if (part === "") continue;
              args += `${part}:${method.getArgumentType(i + 2)} `;
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

/** Creates a class/object proxy that gives access to methods via JS properties */
export function createProxy(self: Class | CObject) {
  const objclass = self instanceof Class ? self : self.class;
  const proxy: any = new Proxy(self, {
    get(target, prop) {
      if (typeof prop === "symbol") {
        if (prop === _proxied) {
          return self;
        } else if (prop === _handle) {
          return self[_handle];
        } else if (prop.description === "Deno.customInspect") {
          return () => {
            try {
              const desc = proxy.description;
              return desc.UTF8String();
            } catch (_) {
              return self instanceof Class
                ? `[class ${self.name}]`
                : `[cobject ${self.className}]`;
            }
          };
        } else return (target as any)[prop];
      } else {
        if (self instanceof CObject) {
          const property = objclass.getProperty(prop);
          if (property) {
            const getter = property.getAttributeValue("G") || prop;
            return createMethodProxy(self, getter)();
          }
        }
        return createMethodProxy(self, prop);
      }
    },
    set(_target, prop, value) {
      if (typeof prop !== "string") return false;
      if (self instanceof CObject) {
        const property = objclass.getProperty(prop);
        if (property) {
          const setter = property.getAttributeValue("S") ||
            `set${prop[0].toUpperCase()}${prop.slice(1)}:`;
          ObjC.msgSend(
            self,
            setter,
            value, // toNative(parseCType(property.getAttributeValue("T") ?? "?"), value),
          );
          return true;
        } else {
          const setter = proxy[`set${prop[0].toUpperCase()}${prop.slice(1)}:`];
          if (
            setter &&
            setter[Symbol.for("Deno.customInspect")]?.() !== "[method nil]"
          ) {
            setter(value);
            return true;
          }
        }
      }
      throw new Error(`Cannot set property ${prop}`);
    },
    has(target, prop) {
      if (typeof prop === "symbol") {
        return prop in target;
      } else {
        if (self instanceof CObject) {
          return !!objclass.getProperty(prop);
        }
        return false;
      }
    },
  });
  return proxy;
}

common.createProxy = createProxy;

/**
 * Objective-C runtime bindings
 *
 * Overview:
 * - Get a registered class by it's name using either `getClass` or
 *   the `classes` proxy to destructure and get multiple classes at
 *   same time.
 *   ```ts
 *   const { NSString, NSObject } = objc.classes;
 *   ```
 *
 * - Import a framework bundle using `import`.
 *   ```ts
 *   objc.import("AppKit");
 *   ```
 *
 * - Send messages, preferably using class proxies, which we provide
 *   by default. In fact, you should never have to deal with other
 *   classes exported from this module such as `Class`, `CObject`, etc.
 *   Most of the Objective-C runtime is abstracted away by proxies.
 *   ```ts
 *   const { NSString } = objc.classes;
 *   const emptyString = NSString.string();
 *   // or chain methods like
 *   const emptyString = NSString.alloc().init();
 *
 *   const hello = NSString.stringWithUTF8String("Hello, world!");
 *   // Convert to JS string
 *   const jsHello = hello.UTF8String();
 *   ```
 *   Only major difference is that instead of `:` in method names, put
 *   `_` (underscores). They get replaced at the time of calling.
 *   Even that is optional, but better than doing
 *   `NSString["stringWithUTF8String:"](...)`.
 */
export class ObjC {
  static readonly autoreleasepool = autoreleasepool;

  /**
   * A proxy that gives access to all loaded classes via JS properties.
   *
   * Usage:
   * ```ts
   * const {
   *   NSString,
   *   NSBundle,
   * } = objc.classes;
   * ```
   */
  static readonly classes: Record<string, any> = new Proxy({}, {
    get: (_, name) => {
      if (typeof name === "symbol") return;
      const cls = ObjC.getClass(name);
      if (!cls) return;
      else return createProxy(cls);
    },
  });

  static readonly protocols: Record<string, Protocol> = new Proxy({}, {
    get: (_, name) => {
      if (typeof name === "symbol") return;
      const protocol = ObjC.getProtocol(name);
      if (!protocol) return;
      else return protocol;
    },
  });

  /** Returns the number of currently registered classes */
  static get classCount() {
    return sys.objc_getClassList(null, 0);
  }

  /** Returns array of all currently registered classes */
  static get classList() {
    const outCount = new Uint32Array(1);
    const classPtrs = new Deno.UnsafePointerView(
      sys.objc_copyClassList(outCount)!,
    );
    const classes = new Array<Class>(outCount[0]);
    for (let i = 0; i < outCount[0]; i++) {
      const ptr = classPtrs.getPointer(i * 8);
      classes[i] = new Class(ptr);
    }
    return classes;
  }

  /** Returns array of all currently registered classes */
  static get protocolList() {
    const outCount = new Uint32Array(1);
    const ptrs = new Deno.UnsafePointerView(
      sys.objc_copyProtocolList(outCount)!,
    );
    const protocols = new Array<Protocol>(outCount[0]);
    for (let i = 0; i < outCount[0]; i++) {
      const ptr = ptrs.getPointer(i * 8);
      protocols[i] = new Protocol(ptr);
    }
    return protocols;
  }

  /** Get a registered class by its name */
  static getClass(name: string): Class | undefined {
    const nameCstr = toCString(name);
    const classPtr = sys.objc_getClass(nameCstr);
    if (classPtr === null) return undefined;
    return new Class(classPtr);
  }

  /** Get a registered class by its name */
  static getProtocol(name: string): Protocol | undefined {
    const nameCstr = toCString(name);
    const classPtr = sys.objc_getProtocol(nameCstr);
    if (classPtr === null) return undefined;
    return new Protocol(classPtr);
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

  /** Send a message (call class/instance method) to class/instance. */
  static msgSend<T = any>(
    obj: any,
    selector: string | Deno.PointerValue | Sel,
    ...args: any[]
  ): T {
    const sel = new Sel(selector);
    if (obj[_proxied]) {
      obj = obj[_proxied];
    }
    const objptr = typeof obj === "bigint" ? obj : obj[_handle];
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
      sys.objc_msgSend!,
      {
        parameters: argDefsNative as Deno.NativeType[],
        result: retDefNative,
      } as any,
    );

    const cargs = [
      typeof obj === "bigint" ? obj : obj[_handle],
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
        if (typeof e === "object" && e !== null && e instanceof Array) {
          const arr = this.classes.NSMutableArray.array();
          for (const ee of e) {
            arr.addObject(ee);
          }
          e = arr;
        }
        return toNative(def, e);
      }),
    ];

    return toJS(fromNative(retDef, (fn.call as any)(...cargs)));
  }

  /**
   * Load a framework at runtime using `NSBundle` API.
   *
   * Example:
   * ```ts
   * objc.import("AppKit");
   * // or
   * objc.import("/System/Library/Frameworks/AppKit.framework");
   * ```
   */
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

  /**
   * Template Tag for sending messages.
   *
   * Example:
   * ```ts
   * const { NSString } = objc.classes;
   * const str = objc.send`${NSString} stringWithUTF8String:${"Hello"}`;
   * ```
   */
  static send(template: TemplateStringsArray, ...args: any[]) {
    return ObjC.msgSend(
      args[0],
      template.map((e) => e.trim()).join(""),
      ...args.slice(1),
    );
  }

  /**
   * Create an Objective C class implementing methods using JS
   * callbacks.
   */
  static createClass(options: ClassCreateOptions) {
    return Class.create(options);
  }
}

export default ObjC;
