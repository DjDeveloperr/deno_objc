import {
  CTypeEncodable,
  fromNative,
  toNative,
  toNativeType,
} from "./encoding.ts";
import { _handle } from "./util.ts";
import { CObject } from "./object.ts";
import common from "./common.ts";
import { Class } from "./class.ts";

const LE =
  (new Uint32Array((new Uint8Array([1, 2, 3, 4])).buffer))[0] === 0x04030201;

const {
  symbols: {
    _NSConcreteStackBlock,
    _Block_copy,
    _Block_release,
  },
} = Deno.build.os === "darwin"
  ? Deno.dlopen(
    "libSystem.dylib",
    {
      _NSConcreteStackBlock: {
        type: "pointer",
      },

      _Block_copy: {
        parameters: ["pointer"],
        result: "pointer",
      },

      _Block_release: {
        parameters: ["pointer"],
        result: "void",
      },
    } as any,
  )
  : null as any;

const copyHelper = new Deno.UnsafeCallback({
  parameters: ["pointer", "pointer"],
  result: "void",
}, () => {
  // noop
});

const disposeHelper = new Deno.UnsafeCallback({
  parameters: ["pointer"],
  result: "void",
}, () => {
  // noop
});

export interface BlockOptions {
  parameters: CTypeEncodable[];
  result: CTypeEncodable;
  fn: (...args: any[]) => any;
}

export class Block {
  cb: Deno.UnsafeCallback;
  inner: Uint8Array;
  innerDesc: Uint8Array;
  [_handle]: Deno.PointerValue;

  constructor(options: BlockOptions) {
    this.inner = new Uint8Array(8 + 4 + 4 + 8 + 8);
    this.innerDesc = new Uint8Array(8 + 8 + 8 + 8);
    this[_handle] = Deno.UnsafePointer.of(this.inner);

    const blockDescView = new DataView(this.innerDesc.buffer);
    const blockView = new DataView(this.inner.buffer);

    this.cb = new Deno.UnsafeCallback({
      parameters: options.parameters.map((p) =>
        toNativeType(p)
      ) as Deno.NativeType[],
      result: toNativeType(options.result),
    } as any, (...args: any[]): any => {
      const result = options.fn(
        ...(args.map((e, i) => {
          const v = fromNative(options.parameters[i], e);
          if (
            v !== null && typeof v === "object" &&
            (v instanceof CObject || v instanceof Class)
          ) {
            return common.createProxy(v);
          } else return v;
        })),
      );
      return toNative(options.result, result);
    });

    // 0x00: class/isa
    blockView.setBigUint64(
      0,
      BigInt(Deno.UnsafePointer.value(_NSConcreteStackBlock)),
      LE,
    );
    // 0x08: flags
    blockView.setInt32(8, 1 << 25, LE);
    // 0x0c: reserved
    blockView.setInt32(8 + 4, 0, LE);
    // 0x10: invoke
    blockView.setBigUint64(
      8 + 4 + 4,
      BigInt(Deno.UnsafePointer.value(this.cb.pointer)),
      LE,
    );
    // 0x18: desc
    blockView.setBigUint64(
      8 + 4 + 4 + 8,
      BigInt(Deno.UnsafePointer.value(Deno.UnsafePointer.of(this.innerDesc))),
      LE,
    );

    // 0x00: reserved
    blockDescView.setBigUint64(0, 0n, LE);
    // 0x08: size
    blockDescView.setBigUint64(8, BigInt(this.inner.byteLength), LE);
    // 0x10: copy
    blockDescView.setBigUint64(
      8 + 8,
      BigInt(Deno.UnsafePointer.value(copyHelper.pointer)),
      LE,
    );
    // 0x18: dispose
    blockDescView.setBigUint64(
      8 + 8 + 8,
      BigInt(Deno.UnsafePointer.value(disposeHelper.pointer)),
      LE,
    );
  }

  copy() {
    return _Block_copy(this[_handle]);
  }

  release() {
    _Block_release(this[_handle]);
    this.inner = new Uint8Array(0);
    this.innerDesc = new Uint8Array(0);
    this[_handle] = null;
    this.cb.close();
  }
}
