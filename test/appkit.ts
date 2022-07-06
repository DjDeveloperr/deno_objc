import objc from "../mod.ts";

objc.import("AppKit");

function NSMakeRect(x: number, y: number, width: number, height: number) {
  return new Float64Array([x, y, width, height]);
}

const {
  NSObject,
  NSApplication,
  NSWindow,
  NSDate,
  NSButton,
  NSTextField,
} = objc.classes;

const app = NSApplication.sharedApplication();
app.setActivationPolicy(0);

const window = NSWindow.alloc().initWithContentRect_styleMask_backing_defer(
  NSMakeRect(100, 100, 300, 300),
  1 | 2 | 4 | 8,
  2,
  0,
);

let close = false;

let btn1 = 0, btn2 = 0;

const WindowDelegate = objc.createClass({
  name: "WindowDelegate",
  superclass: NSObject,
  protocols: [objc.protocols.NSWindowDelegate],
  methods: [
    {
      name: "windowShouldClose:",
      parameters: ["id"],
      result: "bool",
      fn(_sender) {
        console.log("windowShouldClose");
        return true;
      },
    },
    {
      name: "windowWillClose:",
      parameters: ["id"],
      result: "void",
      fn(_notif) {
        console.log("windowWillClose");
        close = true;
      },
    },
    {
      name: "OnButton1Click:",
      parameters: ["id"],
      result: "void",
      fn(_sender) {
        btn1++;
        label1.setStringValue("Button1 clicked " + btn1 + " times");
      },
    },
    {
      name: "OnButton2Click:",
      parameters: ["id"],
      result: "void",
      fn(_sender) {
        btn2++;
        label2.setStringValue("Button2 Clicked " + btn2 + " times");
      },
    },
  ],
});

const delegate = WindowDelegate.proxy.alloc().init();
window.setDelegate(delegate);

window.setTitle("Deno Obj-C");

window.makeKeyAndOrderFront(app);
window.setReleasedWhenClosed(false);
window.setAcceptsMouseMovedEvents(true);

const button1 = NSButton.alloc().initWithFrame(NSMakeRect(50, 225, 90, 25));
button1.setTitle("Button1");
button1.setBezelStyle(1);
button1.setAutoresizingMask(4 | 8);
button1.setTarget(delegate);
button1.setAction("OnButton1Click:");

const button2 = NSButton.alloc().initWithFrame(NSMakeRect(50, 125, 200, 75));
button2.setTitle("Button2");
button2.setBezelStyle(1);
button2.setAutoresizingMask(4 | 8);
button2.setTarget(delegate);
button2.setAction("OnButton2Click:");

const label1 = NSTextField.alloc().initWithFrame(NSMakeRect(50, 80, 150, 20));
label1.setStringValue("Button1 clicked 0 times");
label1.setBezeled(false);
label1.setDrawsBackground(false);
label1.setEditable(false);

const label2 = NSTextField.alloc().initWithFrame(NSMakeRect(50, 50, 150, 20));
label2.setStringValue("Button2 clicked 0 times");
label2.setBezeled(false);
label2.setDrawsBackground(false);
label2.setEditable(false);

window.contentView.addSubview(button1);
window.contentView.addSubview(button2);
window.contentView.addSubview(label1);
window.contentView.addSubview(label2);

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
  if (close) {
    clearInterval(loop);
    return;
  }
  updateEvents();
}, 1000 / 60);
