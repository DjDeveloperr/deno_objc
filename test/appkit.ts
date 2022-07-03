import objc from "../mod.ts";

objc.import("AppKit");
Deno.dlopen("testLib/build/Release/libtestLib.dylib", {});

function NSMakeRect(x: number, y: number, width: number, height: number) {
  return new Float64Array([x, y, width, height]);
}

const {
  NSApplication,
  NSWindow,
  NSColor,
  NSDate,
  WindowDelegate,
  NSTextField,
  NSStackView,
} = objc.classes;

const app = NSApplication.sharedApplication();
app.setActivationPolicy(0);

const window = NSWindow.alloc().initWithContentRect_styleMask_backing_defer(
  NSMakeRect(0, 0, 800, 600),
  1 | 2 | 4 | 8,
  2,
  0,
);

const state = new Uint8Array(1);
const delegate = WindowDelegate.alloc();
delegate.initWithState(state);
window.setDelegate(delegate);

window.setTitle("Deno Obj-C");
// window.setBackgroundColor(NSColor.blueColor());
window.makeKeyAndOrderFront(app);
window.setReleasedWhenClosed(false);
window.setAcceptsMouseMovedEvents(true);

const contentView = window.contentView;
contentView.autoresizesSubviews = true;

const views = [];
for (let i = 0; i < 5; i++) {
  const label = NSTextField.textFieldWithString(`Hello, world! ${i}`);
  label.setBezeled(false);
  label.setEditable(false);
  label.setSelectable(false);
  // label.translatesAutoresizingMaskIntoConstraints = false;
  // vstack.addView_inGravity(label, 1);
  views.push(label);
}

const vstack = NSStackView.stackViewWithViews(views);

// vstack.translatesAutoresizingMaskIntoConstraints = false;
vstack.spacing = 0;
vstack.orientation = 1;
vstack.distribution = 0;
vstack.alignment = 5;
vstack.wantsLayer = true;
vstack.autoresizingMask = 2 | 16
vstack.layer.backgroundColor = NSColor.redColor();

contentView.wantsLayer = true;

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
