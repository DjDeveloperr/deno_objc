import objc, { CObject, Sel, U64, U8 } from "../mod.ts";

Deno.dlopen("/System/Library/Frameworks/AppKit.framework/AppKit", {});

const {
  NSApplication,
  NSWindow,
  NSThemeFrame,
} = objc.classes;

const app = new CObject(objc.msgSend(NSApplication, "sharedApplication"));

objc.msgSend(
  app,
  "setActivationPolicy:",
  objc.sel("NSApplicationActivationPolicyRegular"),
);

const rect = new Float64Array([0, 0, 800, 600]);
const frameRect = new CObject(objc.msgSend(
  NSWindow,
  "frameRectForContentRect:styleMask:",
  rect,
  new U64(0b10001111), // <- this works HOW WTF
));
console.log(frameRect);
console.log(NSThemeFrame.getInstanceMethod(Sel.register("contentRect")));
const rectptr = objc.msgSend(frameRect, "contentRect");
console.log(rectptr);

const windowAlloc = objc.msgSend(
  NSWindow,
  "alloc",
);

console.log(new CObject(windowAlloc));

console.log(
  NSWindow.getInstanceMethod(
    Sel.register("initWithContentRect:styleMask:backing:defer:"),
  ),
);

const window = new CObject(
  objc.msgSend(
    windowAlloc,
    "initWithContentRect:styleMask:backing:defer:",
    rect,
    new U64(0b10001111),
    new U64(2),
    new U8(0),
  ),
);

console.log(window);
