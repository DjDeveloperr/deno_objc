import objc, { CObject, U32, U64 } from "../mod.ts";

Deno.dlopen("testLib/build/Release/libtestLib.dylib", {});

const {
  NSString,
  testLib,
} = objc.classes;

const testAlloc = objc.msgSend(testLib, "alloc");
const bookTitle = objc.msgSend(
  NSString,
  "stringWithCString:encoding:",
  "Harmony: Best Practice",
  new U64(4),
);
const author = objc.msgSend(
  NSString,
  "stringWithCString:encoding:",
  "Helloyunho",
  new U64(4),
);
console.log(testLib);
const testInit = new CObject(
  objc.msgSend(
    testAlloc,
    "initWithTitle:author:year:",
    bookTitle,
    author,
    new U32(2020),
  ),
);
const test = objc.msgSend(
  NSString,
  "stringWithCString:encoding:",
  "Hello World",
  new U64(4),
);
console.log(test.value.toString(16));
const bookInfo = objc.msgSend(testInit, "bookInfoWithComment:", test);
console.log(new CObject(bookInfo));
const cstr = objc.msgSend(bookInfo, "UTF8String");
console.log(new Deno.UnsafePointerView(cstr).getCString());
