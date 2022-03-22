import objc from "../mod.ts";

Deno.dlopen("testLib/build/Release/libtestLib.dylib", {});

const {
  NSString,
  testLib: Book,
} = objc.classes;

const testAlloc = Book.alloc();
const bookTitle = NSString.stringWithUTF8String("Harmony: Best Practice");
const author = NSString.stringWithUTF8String("Helloyunho");
console.log(Book);
const testInit = testAlloc.initWithTitle_author_year(bookTitle, author, 2020);
const test = NSString.stringWithUTF8String("Hello World");
const bookInfo = testInit.bookInfoWithComment(test);
console.log(bookInfo.UTF8String());
