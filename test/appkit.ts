import objc from "../mod.ts";

objc.import("AppKit");

const {
  NSApplication,
  NSWindow,
  NSColor,
} = objc.classes;

const app = NSApplication.sharedApplication();
app.setActivationPolicy(0);

const rect = new Float64Array([0, 0, 800, 600]);

console.log(NSWindow.alloc().initWithContentRect_styleMask_backing_defer);

const window = NSWindow
  .alloc()
  .initWithContentRect_styleMask_backing_defer(
    rect,
    0,
    2,
    0,
  );

console.log(window);

window.setBackgroundColor(NSColor.blueColor());
window.makeKeyAndOrderFront(app);

console.log(window.frame());
