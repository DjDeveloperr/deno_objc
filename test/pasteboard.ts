import objc from "../mod.ts";

objc.import("AppKit");

const {
  NSPasteboard,
} = objc.classes;

const pasteboard = NSPasteboard.generalPasteboard();
console.log(pasteboard);
