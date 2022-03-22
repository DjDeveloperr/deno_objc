// https://developer.apple.com/library/archive/documentation/Cocoa/Conceptual/ObjCRuntimeGuide/Articles/ocrtTypeEncodings.html#//apple_ref/doc/uid/TP40008048-CH100

import { Class } from "./class.ts";
import { CObject } from "./object.ts";
import { Sel } from "./sel.ts";
import { _handle, isArrayBufferView, toCString } from "./util.ts";

const CHAR = "c";
const INT = "i";
const SHORT = "s";
const LONG = "l";
const LONG_LONG = "q";
const UNSIGNED_CHAR = "C";
const UNSIGNED_INT = "I";
const UNSIGNED_SHORT = "S";
const UNSIGNED_LONG = "L";
const UNSIGNED_LONG_LONG = "Q";
const FLOAT = "f";
const DOUBLE = "d";
const BOOL = "B";
const VOID = "v";
const STRING = "*";
const ID = "@";
const CLASS = "#";
const SEL = ":";
const ARRAY_BEGIN = "[";
const ARRAY_END = "]";
const NAME_BEGIN = "{";
const NAME_END = "}";
const BITFIELD_BEGIN = "b";
const POINTER_BEGIN = "^";
const UNKNOWN = "?";

export type CType =
  | "char"
  | "int"
  | "short"
  | "long"
  | "long long"
  | "unsigned char"
  | "unsigned int"
  | "unsigned short"
  | "unsigned long"
  | "unsigned long long"
  | "float"
  | "double"
  | "bool"
  | "void"
  | "string"
  | "id"
  | "class"
  | "sel"
  | "array"
  | "struct"
  | "bitfield"
  | "pointer"
  | "unknown";

export interface BaseCTypeInfo {
  type: CType;
}

export interface CArrayTypeInfo extends BaseCTypeInfo {
  type: "array";
  length: number;
  elementType: CTypeInfo;
}

export interface CStructTypeInfo extends BaseCTypeInfo {
  type: "struct";
  name: string;
  fields: CTypeInfo[];
}

export interface CBitfieldTypeInfo extends BaseCTypeInfo {
  type: "bitfield";
  size: number;
}

export interface CPointerTypeInfo extends BaseCTypeInfo {
  type: "pointer";
  pointeeType: CTypeInfo;
}

export interface RestCTypeInfo extends BaseCTypeInfo {
  type: Exclude<CType, "array" | "struct" | "bitfield" | "pointer">;
}

export type CTypeInfo =
  | RestCTypeInfo
  | CArrayTypeInfo
  | CStructTypeInfo
  | CBitfieldTypeInfo
  | CPointerTypeInfo;

class CTypeParser {
  source: string;
  index: number;

  constructor(source: string) {
    this.source = source;
    this.index = 0;
  }

  get current() {
    return this.source[this.index];
  }

  get peek() {
    return this.source[this.index + 1];
  }

  next() {
    const char = this.source[this.index++];
    if (char === undefined) {
      throw new Error("Unexpected end of source");
    }
    return char;
  }

  parse(): CTypeInfo {
    const char = this.next();
    switch (char) {
      case CHAR:
        return { type: "char" };

      case INT:
        return { type: "int" };

      case SHORT:
        return { type: "short" };

      case LONG:
        return { type: "long" };

      case LONG_LONG:
        return { type: "long long" };

      case UNSIGNED_CHAR:
        return { type: "unsigned char" };

      case UNSIGNED_INT:
        return { type: "unsigned int" };

      case UNSIGNED_SHORT:
        return { type: "unsigned short" };

      case UNSIGNED_LONG:
        return { type: "unsigned long" };

      case UNSIGNED_LONG_LONG:
        return { type: "unsigned long long" };

      case FLOAT:
        return { type: "float" };

      case DOUBLE:
        return { type: "double" };

      case BOOL:
        return { type: "bool" };

      case VOID:
        return { type: "void" };

      case STRING:
        return { type: "string" };

      case ID:
        return { type: "id" };

      case CLASS:
        return { type: "class" };

      case SEL:
        return { type: "sel" };

      case ARRAY_BEGIN: {
        let length = 0;
        while (/\d/.test(this.current)) {
          length = 10 * length + Number(this.next());
        }
        const elementType = this.parse();
        if (this.next() !== ARRAY_END) {
          throw new Error("Expected ']'");
        }

        return {
          type: "array",
          length,
          elementType,
        };
      }

      case NAME_BEGIN: {
        let name = "";
        while (this.current !== "=") {
          name += this.current;
          this.next();
        }
        this.next();
        const fields: CTypeInfo[] = [];
        while ((this.current as string) !== NAME_END) {
          fields.push(this.parse());
        }
        this.next();
        return {
          type: "struct",
          name,
          fields,
        };
      }

      case BITFIELD_BEGIN: {
        const size = parseInt(this.next(), 10);
        return {
          type: "bitfield",
          size,
        };
      }

      case POINTER_BEGIN: {
        const pointeeType = this.parse();
        return {
          type: "pointer",
          pointeeType,
        };
      }

      case UNKNOWN:
        return { type: "unknown" };

      case "r":
      case "n":
      case "N":
      case "o":
      case "O":
      case "R":
      case "v":
        return this.parse();

      default:
        throw new Error(`Unexpected character: '${char}' in '${this.source}'`);
    }
  }
}

export function parseCType(source: string) {
  const parser = new CTypeParser(source);
  return parser.parse();
}

export function toNativeType(enc: CTypeInfo): Deno.NativeType {
  switch (enc.type) {
    case "char":
      return "u8";
    case "int":
      return "i32";
    case "short":
      return "i16";
    case "long":
      return "i32";
    case "long long":
      return "i64";
    case "unsigned char":
      return "u8";
    case "unsigned int":
      return "u32";
    case "unsigned short":
      return "u16";
    case "unsigned long":
      return "u32";
    case "unsigned long long":
      return "u64";
    case "float":
      return "f32";
    case "double":
      return "f64";
    case "bool":
      return "u8";
    case "void":
      return "void";
    case "string":
      return "pointer";
    case "id":
      return "pointer";
    case "class":
      return "pointer";
    case "sel":
      return "pointer";
    case "array":
      return "pointer";
    case "struct":
      return "pointer";
    case "pointer":
      return "pointer";
    case "bitfield":
      return "u64";
    case "unknown":
      return "pointer";
  }
}

function expectNumber(v: any) {
  if (
    typeof v !== "number" && typeof v !== "bigint" && typeof v !== "boolean"
  ) {
    throw new Error("Expected number, got " + typeof v);
  }
}

export function toNative(enc: CTypeInfo, v: any) {
  switch (enc.type) {
    case "char": { // u8
      if (typeof v === "string") {
        return v.charCodeAt(0);
      } else {
        expectNumber(v);
        return v;
      }
    }

    case "int": // i32
    case "short": // i16
    case "long": // i32
    case "long long": // i64
    case "unsigned char": // u8
    case "unsigned int": // u32
    case "unsigned short": // u16
    case "unsigned long": // u32
    case "unsigned long long": // u64
    case "float": // f32
    case "double": // f64
    case "bool": // u8
    case "bitfield": // u64
      expectNumber(v);
      return Number(v);

    case "void": // void
      throw new Error("Cannot map encoding 'void' to Native Value");

    case "string": // pointer
      return toCString(v);

    case "id":
    case "class":
    case "sel":
    case "pointer":
    case "unknown":
    case "array":
    case "struct": {
      if (
        v === null || v instanceof Deno.UnsafePointer || isArrayBufferView(v)
      ) {
        return v;
      } else if (typeof v === "object" && _handle in v) {
        return v[_handle];
      } else {
        throw new Error(
          `Cannot map ${Deno.inspect(v)} (${typeof v} ${
            _handle in v
          }) to Native Value of encoding ${Deno.inspect(enc)}`,
        );
      }
    }
  }
}

export function fromNative(enc: CTypeInfo, v: any) {
  console.log("fromNative", enc, v);

  switch (enc.type) {
    case "char": // u8
      return String.fromCharCode(v);

    case "int": // i32
    case "short": // i16
    case "long": // i32
    case "long long": // i64
    case "unsigned char": // u8
    case "unsigned int": // u32
    case "unsigned short": // u16
    case "unsigned long": // u32
    case "unsigned long long": // u64
    case "float": // f32
    case "double": // f64
    case "bitfield": // u64
      return Number(v);

    case "bool": // u8
      return v !== 0;

    case "void": // void
      return undefined;

    case "string": // pointer
      return new Deno.UnsafePointerView(v).getCString();

    case "id":
    case "class":
    case "sel":
    case "pointer":
    case "unknown":
    case "array":
    case "struct": {
      if (v === null || v.value === 0n) {
        return null;
      } else if (enc.type === "pointer" || enc.type === "unknown") {
        return v;
      } else if (enc.type === "id") {
        return new CObject(v);
      } else if (enc.type === "class") {
        return new Class(v);
      } else if (enc.type === "sel") {
        return new Sel(v);
      }
    }
  }
}
