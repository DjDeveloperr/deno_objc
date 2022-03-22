import objc from "../mod.ts";

const {
  NSDate,
  NSDateFormatter,
} = objc.classes;

const date = NSDate.date();
const dateFormatter = NSDateFormatter
  .localizedStringFromDate_dateStyle_timeStyle(date, 2, 2);
console.log(dateFormatter.UTF8String());
