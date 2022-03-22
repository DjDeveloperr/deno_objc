import sys from "./bindings.ts";
import { Ivar } from "./ivar.ts";
import { Method } from "./method.ts";
import { Property } from "./property.ts";
import { Sel } from "./sel.ts";
import { _handle, toCString } from "./util.ts";

/**
 * Represents an Objective-C class.
 */
export class Class {
  [_handle]: Deno.UnsafePointer;

  get handle() {
    return this[_handle];
  }

  constructor(handle: Deno.UnsafePointer) {
    this[_handle] = handle;
  }

  get name() {
    const ptr = sys.class_getName(this[_handle]);
    const ptrView = new Deno.UnsafePointerView(ptr);
    return ptrView.getCString();
  }

  get superclass(): Class | undefined {
    const superclass = sys.class_getSuperclass(this[_handle]);
    if (superclass.value === 0n) {
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
    if (ptr.value === 0n) return undefined;
    else return new Method(ptr);
  }

  getClassMethod(sel: Sel) {
    const ptr = sys.class_getClassMethod(this[_handle], sel[_handle]);
    if (ptr.value === 0n) return undefined;
    else return new Method(ptr);
  }

  getInstanceVariable(name: string) {
    const nameCstr = toCString(name);
    const ptr = sys.class_getInstanceVariable(this[_handle], nameCstr);
    if (ptr.value === 0n) return undefined;
    else return new Ivar(ptr);
  }

  getClassVariable(name: string) {
    const nameCstr = toCString(name);
    const ptr = sys.class_getClassVariable(this[_handle], nameCstr);
    if (ptr.value === 0n) return undefined;
    else return new Ivar(ptr);
  }

  getProperty(name: string) {
    const nameCstr = toCString(name);
    const ptr = sys.class_getProperty(this[_handle], nameCstr);
    if (ptr.value === 0n) return undefined;
    else return new Property(ptr);
  }

  get instanceMethods() {
    const outCount = new Uint32Array(1);
    const methods = new Deno.UnsafePointerView(
      sys.class_copyMethodList(this[_handle], outCount),
    );
    const methodsArray = new Array<Method>(outCount[0]);
    for (let i = 0; i < outCount[0]; i++) {
      methodsArray[i] = new Method(
        new Deno.UnsafePointer(methods.getBigUint64(i * 8)),
      );
    }
    return methodsArray;
  }

  get instanceVariables() {
    const outCount = new Uint32Array(1);
    const ivars = new Deno.UnsafePointerView(
      sys.class_copyIvarList(this[_handle], outCount),
    );
    const ivarsArray = new Array<Ivar>(outCount[0]);
    for (let i = 0; i < outCount[0]; i++) {
      ivarsArray[i] = new Ivar(
        new Deno.UnsafePointer(ivars.getBigUint64(i * 8)),
      );
    }
    return ivarsArray;
  }

  get properties() {
    const outCount = new Uint32Array(1);
    const props = new Deno.UnsafePointerView(
      sys.class_copyPropertyList(this[_handle], outCount),
    );
    const propsArray = new Array<Property>(outCount[0]);
    for (let i = 0; i < outCount[0]; i++) {
      propsArray[i] = new Property(
        new Deno.UnsafePointer(props.getBigUint64(i * 8)),
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
}
