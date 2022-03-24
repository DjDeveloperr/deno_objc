import objc, { CObject } from "../mod.ts";
import { _proxied } from "../src/util.ts";

objc.import("AppKit");
Deno.dlopen("testLib/build/Release/libtestLib.dylib", {});

const {
  NSApplication,
  NSWindow,
  NSColor,
  NSDate,
  WindowDelegate,
  NSTextField,
  NSStackView,
  NSMutableArray,
} = objc.classes;

const app = NSApplication.sharedApplication();
app.setActivationPolicy(0);

const window = NSWindow.alloc().initWithContentRect_styleMask_backing_defer(
  new Float64Array([0, 0, 800, 600]),
  1 | 2 | 4 | 8,
  2,
  0,
);

const state = new Uint8Array(1);
const delegate = WindowDelegate.alloc();
delegate.initWithState(state);
window.setDelegate(delegate);

window.setTitle("Deno Obj-C");
window.setBackgroundColor(NSColor.blueColor());
window.makeKeyAndOrderFront(app);
window.setReleasedWhenClosed(false);
window.setAcceptsMouseMovedEvents(true);

const contentView = window.contentView;
const label = NSTextField.alloc().initWithFrame(
  new Float64Array([0, 0, 800, 600]),
);
label.setStringValue("Hello, world!");
label.setBezeled(false);
label.setEditable(true);
label.setSelectable(true);
label.translatesAutoresizingMaskIntoConstraints = false
const vstack = NSStackView.stackViewWithViews(null);
// null works
vstack.addView_inGravity(label, 1);
vstack.orientation = 1;
contentView.addSubview(vstack);

window.center();

app.activateIgnoringOtherApps(true);

function updateEvents() {
  while (true) {
    const event = app.nextEventMatchingMask_untilDate_inMode_dequeue(
      2n ** 64n - 1n,
      NSDate.distantPast(),
      "kCFRunLoopDefaultMode",
      true,
    );
    if (event) {
      app.sendEvent(event);
    } else {
      break;
    }
  }
}

const loop = setInterval(() => {
  if (state[0] === 1) {
    clearInterval(loop);
    return;
  }
  updateEvents();
  contentView.setNeedsDisplay(true);
}, 1000 / 60);
