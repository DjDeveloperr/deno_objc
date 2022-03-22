import objc from "../mod.ts";

const {
  NSDate,
  NSDateFormatter,
} = objc.classes;

const date = objc.msgSend(NSDate, "date");
console.log(date);
const dateFormatter = objc.msgSend(
  NSDateFormatter,
  "localizedStringFromDate:dateStyle:timeStyle:",
  date,
  2,
  2,
);
console.log(dateFormatter);
const cstr = objc.msgSend(dateFormatter, "UTF8String");
console.log(cstr);
