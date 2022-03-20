// https://developer.apple.com/library/archive/documentation/Cocoa/Conceptual/ObjCRuntimeGuide/Articles/ocrtTypeEncodings.html#//apple_ref/doc/uid/TP40008048-CH100

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

export function toNativeType(enc: string): Deno.NativeType {
  switch (enc) {
    case CHAR:
      return "u8";
    case INT:
      return "i32";
    case SHORT:
      return "i16";
    case LONG:
      return "i32";
    case LONG_LONG:
      return "i64";
    case UNSIGNED_CHAR:
      return "u8";
    case UNSIGNED_INT:
      return "u32";
    case UNSIGNED_SHORT:
      return "u16";
    case UNSIGNED_LONG:
      return "u32";
    case UNSIGNED_LONG_LONG:
      return "u64";
    case FLOAT:
      return "f32";
    case DOUBLE:
      return "f64";
    case BOOL:
      return "u8";
    case VOID:
      return "void";
    case STRING:
      return "pointer";
    case ID:
      return "pointer";
    case CLASS:
      return "pointer";
    case SEL:
      return "pointer";
    case UNKNOWN:
      throw new Error("Don't know how to convert type '" + enc + "' to native");
    default:
      if (
        (enc.startsWith(ARRAY_BEGIN) && enc.endsWith(ARRAY_END)) ||
        (enc.startsWith(NAME_BEGIN) && enc.endsWith(NAME_END)) ||
        enc.startsWith(POINTER_BEGIN)
      ) {
        return "pointer";
      } else if (enc.startsWith(BITFIELD_BEGIN)) {
        return "u64";
      }
      throw new Error(`Unsupported type: ${enc}`);
  }
}
