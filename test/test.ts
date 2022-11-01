import objc from "../mod.ts";

const {
  NSDate,
  NSDateFormatter,
  NSObject,
} = objc.classes;

const date = NSDate.date();
const dateFormatter = NSDateFormatter
  .localizedStringFromDate_dateStyle_timeStyle(date, 2, 2);
console.log(dateFormatter.UTF8String());

const MyClass = objc.createClass({
  name: "MyClass",
  superclass: NSObject,
  ivars: [
    {
      name: "iv",
      type: "int",
    },
  ],
  properties: ["iv"],
  methods: [
    {
      name: "iv",
      parameters: [],
      result: "int",
      fn() {
        return 1;
      },
    },
    {
      name: "setIv:",
      parameters: ["int"],
      result: "void",
      fn(iv: number) {
        console.log("set iv", iv);
      },
    },
    {
      name: "test:",
      parameters: ["id"],
      result: "void",
      fn(obj: any) {
        console.log("test", obj.iv);
      },
    },
  ],
}).proxy;

const cls = MyClass.alloc().init();
console.log(cls.iv);
cls.iv = 2;
cls.test(cls);
