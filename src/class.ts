import sys from "./bindings.ts";
import {
  CTypeEncodable,
  CTypeInfo,
  encodeCType,
  fromNative,
  getCTypeSize,
  toNative,
  toNativeType,
} from "./encoding.ts";
import { Ivar } from "./ivar.ts";
import { Method } from "./method.ts";
import { CObject } from "./object.ts";
import { Property } from "./property.ts";
import type { Protocol } from "./protocol.ts";
import { Sel } from "./sel.ts";
import { _handle, toCString } from "./util.ts";
import common from "./common.ts";

const CSTR_REFS = new Set<Uint8Array>();

export interface ClassIvarOptions {
  name: string;
  type: CTypeEncodable;
}

export interface ClassMethodThis {
  class: Class;
  self: any;
  view: Deno.UnsafePointerView;
  object: CObject;
  pointer: Deno.PointerValue;
  selector: Sel;
}

export interface ClassMethodOptions<
  P extends CTypeEncodable[] = CTypeEncodable[],
  R extends CTypeEncodable = CTypeEncodable,
> {
  name: string;
  parameters: P;
  result: R;
  // TODO: map CType generics to JS value equivalents
  fn: (this: ClassMethodThis, ...args: any[]) => any;
}

// export interface ClassPropertyOptions {
//   name: string;
//   type: CTypeEncodable;
//   getter?: string;
//   setter?: string;
// }

export interface ClassCreateOptions {
  name: string;
  superclass?: Class;
  protocols?: Protocol[];
  ivars?: ClassIvarOptions[];
  methods?: ClassMethodOptions[];
  properties?: string[];
}

/**
 * Represents an Objective-C class.
 */
export class Class {
  [_handle]: Deno.PointerValue;

  get handle() {
    return this[_handle];
  }

  get proxy() {
    return common.createProxy(this);
  }

  constructor(handle: Deno.PointerValue) {
    this[_handle] = handle;
  }

  static alloc(name: string, superclass?: Class, extraBytes?: number) {
    const nameCstr = toCString(name);
    return new Class(
      sys.objc_allocateClassPair(
        superclass?.[_handle] ?? null,
        nameCstr,
        extraBytes ?? 0,
      ),
    );
  }

  get name() {
    const ptr = sys.class_getName(this[_handle]);
    return Deno.UnsafePointerView.getCString(ptr!);
  }

  get superclass(): Class | undefined {
    const superclass = sys.class_getSuperclass(this[_handle]);
    if (superclass === null) {
      return undefined;
    } else return new Class(superclass);
  }

  get metaclass() {
    return new Class(sys.object_getClass(this[_handle]));
  }

  get instanceSize() {
    return sys.class_getInstanceSize(this[_handle]);
  }

  // get imageName() {
  //   const ptr = sys.class_getImageName(this[_handle]);
  //   const ptrView = new Deno.UnsafePointerView(ptr);
  //   return ptrView.getCString();
  // }

  getInstanceMethod(sel: Sel) {
    const ptr = sys.class_getInstanceMethod(this[_handle], sel[_handle]);
    if (ptr === null) return undefined;
    else return new Method(ptr);
  }

  getClassMethod(sel: Sel) {
    const ptr = sys.class_getClassMethod(this[_handle], sel[_handle]);
    if (ptr === null) return undefined;
    else return new Method(ptr);
  }

  getInstanceVariable(name: string) {
    const nameCstr = toCString(name);
    const ptr = sys.class_getInstanceVariable(this[_handle], nameCstr);
    if (ptr === null) return undefined;
    else return new Ivar(ptr);
  }

  addInstanceVariable(name: string, type: string, size: number) {
    const nameCstr = toCString(name);
    const typeCstr = toCString(type);
    return Boolean(
      sys.class_addIvar(this[_handle], nameCstr, size, 0, typeCstr),
    );
  }

  getClassVariable(name: string) {
    const nameCstr = toCString(name);
    const ptr = sys.class_getClassVariable(this[_handle], nameCstr);
    if (ptr === null) return undefined;
    else return new Ivar(ptr);
  }

  getProperty(name: string) {
    const nameCstr = toCString(name);
    const ptr = sys.class_getProperty(this[_handle], nameCstr);
    if (ptr === null) return undefined;
    else return new Property(ptr);
  }

  addProperty(name: string, attributes: [string, string][]) {
    const nameCstr = toCString(name);
    const attrs = new Array<BigUint64Array>(attributes.length);
    for (let i = 0; i < attributes.length; i++) {
      const cstr = toCString(attributes[i][0]);
      CSTR_REFS.add(cstr);
      const cstr2 = toCString(attributes[i][1]);
      CSTR_REFS.add(cstr2);
      CSTR_REFS.add(
        attrs[i] = new BigUint64Array([
          BigInt(Deno.UnsafePointer.value(Deno.UnsafePointer.of(cstr))),
          BigInt(Deno.UnsafePointer.value(Deno.UnsafePointer.of(cstr2))),
        ]) as any,
      );
    }
    return Boolean(
      sys.class_addProperty(
        this[_handle],
        nameCstr,
        attrs.length === 0 ? null : new BigUint64Array(
          attrs.map((e) =>
            BigInt(Deno.UnsafePointer.value(Deno.UnsafePointer.of(e)))
          ),
        ),
        attrs.length,
      ),
    );
  }

  addMethod(sel: Sel, imp: Deno.PointerValue, types?: string) {
    const typesCstr = types ? toCString(types) : null;
    return Boolean(
      sys.class_addMethod(this[_handle], sel[_handle], imp, typesCstr),
    );
  }

  replaceMethod(sel: Sel, imp: Deno.PointerValue, types?: string) {
    const typesCstr = types ? toCString(types) : null;
    return Boolean(
      sys.class_replaceMethod(this[_handle], sel[_handle], imp, typesCstr),
    );
  }

  addProtocol(protocol: Protocol) {
    return Boolean(sys.class_addProtocol(this[_handle], protocol[_handle]));
  }

  get instanceMethods() {
    const outCount = new Uint32Array(1);
    const methods = new Deno.UnsafePointerView(
      sys.class_copyMethodList(this[_handle], outCount)!,
    );
    const methodsArray = new Array<Method>(outCount[0]);
    for (let i = 0; i < outCount[0]; i++) {
      methodsArray[i] = new Method(
        methods.getPointer(i * 8),
      );
    }
    return methodsArray;
  }

  get instanceVariables() {
    const outCount = new Uint32Array(1);
    const ivars = new Deno.UnsafePointerView(
      sys.class_copyIvarList(this[_handle], outCount)!,
    );
    const ivarsArray = new Array<Ivar>(outCount[0]);
    for (let i = 0; i < outCount[0]; i++) {
      ivarsArray[i] = new Ivar(
        ivars.getPointer(i * 8),
      );
    }
    return ivarsArray;
  }

  get properties() {
    const outCount = new Uint32Array(1);
    const props = new Deno.UnsafePointerView(
      sys.class_copyPropertyList(this[_handle], outCount)!,
    );
    const propsArray = new Array<Property>(outCount[0]);
    for (let i = 0; i < outCount[0]; i++) {
      propsArray[i] = new Property(
        props.getPointer(i * 8),
      );
    }
    return propsArray;
  }

  respondsTo(sel: Sel) {
    return Boolean(sys.class_respondsToSelector(this[_handle], sel[_handle]));
  }

  [Symbol.for("Deno.customInspect")]() {
    return `[class ${this.name}]`;
  }

  static create(options: ClassCreateOptions) {
    const ivars = options.ivars?.map((ivar) => ({
      name: ivar.name,
      size: getCTypeSize(ivar.type),
      encoded: encodeCType(ivar.type),
    })) ?? [];
    const size = ivars.reduce((acc, ivar) => acc + ivar.size, 0);
    const cls = Class.alloc(options.name, options.superclass, size);
    options.protocols?.forEach((protocol) => cls.addProtocol(protocol));
    ivars.forEach((ivar) =>
      cls.addInstanceVariable(ivar.name, ivar.encoded, ivar.size)
    );
    options.properties?.forEach((prop) => {
      cls.addProperty(prop, []);
    });
    options.methods?.forEach((method) => {
      const params: CTypeInfo[] = method.parameters.map((e) =>
        typeof e === "string" ? ({ type: e }) : e
      );
      const result: CTypeInfo = typeof method.result === "string"
        ? ({ type: method.result })
        : method.result;
      const cb = new Deno.UnsafeCallback(
        {
          parameters: [
            "pointer",
            "pointer",
            ...params.map((e) => toNativeType(e)) as Deno.NativeType[],
          ],
          result: toNativeType(result),
        } as any,
        (
          self: Deno.PointerValue,
          cmd: Deno.PointerValue,
          ...args: any[]
        ): any => {
          const obj = new CObject(self);
          const jsargs = args.map((e, i) => {
            const v = fromNative(params[i], e);
            if (
              v !== null && typeof v === "object" &&
              (v instanceof CObject || v instanceof Class)
            ) {
              return common.createProxy(v);
            } else return v;
          });
          const res = method.fn.bind({
            class: cls,
            pointer: self,
            object: obj,
            self: common.createProxy(obj),
            view: new Deno.UnsafePointerView(self!),
            selector: new Sel(cmd),
          })(...jsargs);
          return toNative(result, res);
        },
      );
      const enc = `${encodeCType(result)}@:${
        params.map((e) => encodeCType(e)).join("")
      }`;
      cls.addMethod(new Sel(method.name), cb.pointer, enc);
    });
    sys.objc_registerClassPair(cls.handle);
    return cls;
  }
}
