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

export type SimpleCType = Exclude<
  CType,
  "array" | "struct" | "bitfield" | "pointer"
>;

export interface RestCTypeInfo extends BaseCTypeInfo {
  type: SimpleCType;
}

export type CTypeInfo =
  | RestCTypeInfo
  | CArrayTypeInfo
  | CStructTypeInfo
  | CBitfieldTypeInfo
  | CPointerTypeInfo;

export type CTypeEncodable = SimpleCType | CTypeInfo;

export function encodeCType(ty: CTypeEncodable): string {
  if (typeof ty === "string") {
    ty = { type: ty };
  }

  switch (ty.type) {
    case "char":
      return CHAR;
    case "int":
      return INT;
    case "short":
      return SHORT;
    case "long":
      return LONG;
    case "long long":
      return LONG_LONG;
    case "unsigned char":
      return UNSIGNED_CHAR;
    case "unsigned int":
      return UNSIGNED_INT;
    case "unsigned short":
      return UNSIGNED_SHORT;
    case "unsigned long":
      return UNSIGNED_LONG;
    case "unsigned long long":
      return UNSIGNED_LONG_LONG;
    case "float":
      return FLOAT;
    case "double":
      return DOUBLE;
    case "bool":
      return BOOL;
    case "void":
      return VOID;
    case "string":
      return STRING;
    case "id":
      return ID;
    case "class":
      return CLASS;
    case "sel":
      return SEL;
    case "array":
      return ARRAY_BEGIN + ty.length + encodeCType(ty.elementType) + ARRAY_END;
    case "struct":
      return NAME_BEGIN + ty.name + "=" + ty.fields.map(encodeCType).join("") +
        NAME_END;
    case "bitfield":
      return BITFIELD_BEGIN + ty.size;
    case "pointer":
      return POINTER_BEGIN + encodeCType(ty.pointeeType);
    case "unknown":
      return UNKNOWN;

    default:
      throw new Error("Unknown CType: " + Deno.inspect(ty));
  }
}

export function getCTypeSize(ty: CTypeEncodable): number {
  if (typeof ty === "string") {
    ty = { type: ty };
  }

  switch (ty.type) {
    case "char":
      return 1;
    case "int":
      return 4;
    case "short":
      return 2;
    case "long":
      return 4;
    case "long long":
      return 8;
    case "unsigned char":
      return 1;
    case "unsigned int":
      return 4;
    case "unsigned short":
      return 2;
    case "unsigned long":
      return 4;
    case "unsigned long long":
      return 8;
    case "float":
      return 4;
    case "double":
      return 8;
    case "bool":
      return 1;
    case "void":
      return 0;
    case "string":
      return 8;
    case "id":
      return 8;
    case "class":
      return 8;
    case "sel":
      return 8;
    case "array":
      return ty.length * getCTypeSize(ty.elementType);
    case "struct":
      return ty.fields.reduce((acc, field) => acc + getCTypeSize(field), 0);
    case "bitfield":
      return ty.size;
    case "pointer":
      return 8;
    case "unknown":
      return 0;

    default:
      throw new Error("Unknown CType: " + Deno.inspect(ty));
  }
}

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

export function toNativeType(enc: CTypeInfo): Deno.NativeResultType {
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
      return {
        struct: new Array(enc.length).fill(enc.elementType).map(toNativeType),
      } as any;
    case "struct":
      return { struct: enc.fields.map(toNativeType) } as any;
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
    case "unsigned char": // u8
    case "unsigned int": // u32
    case "unsigned short": // u16
    case "unsigned long": // u32
    case "float": // f32
    case "double": // f64
    case "bool": // u8
    case "bitfield": // u64
      expectNumber(v);
      return Number(v);

    case "unsigned long long":
    case "long long": {
      return BigInt(v);
    }

    case "void": // void
      return undefined;

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
        v === null || typeof v === "bigint" || isArrayBufferView(v)
      ) {
        return v;
      } else if (enc.type === "sel" && typeof v === "string") {
        return new Sel(v)[_handle];
      } else if (typeof v === "object" && _handle in v) {
        return v[_handle];
      } else {
        throw new Error(
          `Cannot map ${Deno.inspect(v)} to Native Value of encoding ${
            Deno.inspect(enc)
          }`,
        );
      }
    }
  }
}

export function fromNative(enc: CTypeInfo, v: any) {
  switch (enc.type) {
    case "char": // u8
      return v;

    case "int": // i32
    case "short": // i16
    case "long": // i32
    case "unsigned char": // u8
    case "unsigned int": // u32
    case "unsigned short": // u16
    case "unsigned long": // u32
    case "float": // f32
    case "double": // f64
    case "bitfield": // u64
      return Number(v);

    case "unsigned long long":
      return new BigUint64Array(v.buffer)[0];

    case "long long":
      return new BigInt64Array(v.buffer)[0];

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
        if (v === 0n) return null;
        return v;
      } else if (enc.type === "id") {
        if (v === 0n) return null;
        return new CObject(v);
      } else if (enc.type === "class") {
        if (v === 0n) return null;
        return new Class(v);
      } else if (enc.type === "sel") {
        if (v === 0n) return null;
        return new Sel(v);
      } else if (enc.type === "struct") {
        return v;
      }
    }
  }
}
