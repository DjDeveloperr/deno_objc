import objc from "../mod.ts";

const {
  NSDate,
  NSDateFormatter,
} = objc.classes;

const date = NSDate.date();
console.log(date);
const dateFormatter = NSDateFormatter
  ["localizedStringFromDate:dateStyle:timeStyle:"](date, 2, 2);
console.log(dateFormatter);
const cstr = dateFormatter.UTF8String();
console.log(cstr);
