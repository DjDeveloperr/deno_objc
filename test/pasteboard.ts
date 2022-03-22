import objc from "../mod.ts";

objc.import("AppKit");

const {
  NSPasteBoard,
} = objc.classes;

const pasteboard = NSPasteBoard.generalPasteboard();
console.log(pasteboard);
