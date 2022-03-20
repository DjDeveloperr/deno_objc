import objc, { U32 } from "../mod.ts";

const {
  NSDate,
  NSDateFormatter,
} = objc.classes;

const date = objc.msgSend(NSDate, "date");
const dateFormatter = objc.msgSend(
  NSDateFormatter,
  "localizedStringFromDate:dateStyle:timeStyle:",
  date,
  new U32(2),
  new U32(2),
);
console.log(dateFormatter);
const cstr = objc.msgSend(dateFormatter, "UTF8String");
console.log(new Deno.UnsafePointerView(cstr).getCString());
