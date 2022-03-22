import objc from "../mod.ts";

objc.import("AppKit");

const {
  NSApplication,
  NSWindow,
} = objc.classes;

const app = NSApplication.sharedApplication();
app.setActivationPolicy(0);

// const rect = new Float64Array([0, 0, 800, 600]);

const window = NSWindow.alloc(); //.initWithContentRect_styleMask_backing_defer(
//   rect,
//   0b110,
//   2,
//   0,
// );

console.log(window);
