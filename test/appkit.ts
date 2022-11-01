import objc, { Block } from "../mod.ts";
import { _handle } from "../src/util.ts";

objc.import("AppKit");
objc.import("UserNotifications");

function NSMakeRect(x: number, y: number, width: number, height: number) {
  return new Float64Array([x, y, width, height]);
}

function NSMakeSize(width: number, height: number) {
  return new Float64Array([width, height]);
}

const {
  NSObject,
  NSApplication,
  NSWindow,
  NSDate,
  NSButton,
  NSTextField,
  NSStatusBar,
  NSPopover,
  NSViewController,
  NSView,
  UNUserNotificationCenter,
  UNMutableNotificationContent,
  UNNotificationRequest,
  UNTimeIntervalNotificationTrigger,
} = objc.classes;

const app = NSApplication.sharedApplication();
app.setActivationPolicy(0);

const window = NSWindow.alloc().initWithContentRect_styleMask_backing_defer(
  NSMakeRect(100, 100, 300, 300),
  1 | 2 | 4,
  2,
  0,
);

// try to make it floating window
window.opaque = false;
window.level = 3;

let close = false;

let btn1 = 0, btn2 = 0;

const popoverView = NSView.alloc().initWithFrame(NSMakeRect(0, 0, 300, 300));

const contentViewController = objc.createClass({
  name: "ContentViewController",
  superclass: NSViewController,
  protocols: [],
  methods: [
    {
      name: "loadView",
      result: "void",
      parameters: [],
      fn() {
        this.self.view = popoverView;
      },
    },
  ],
});

const popover = NSPopover.alloc().init();
popover.behavior = 1;
popover.contentSize = NSMakeSize(200, 200);
const cvc = contentViewController.proxy.alloc().initWithNibName_bundle_(
  null,
  null,
);
popover.contentViewController = cvc;

const bar = NSStatusBar.systemStatusBar().statusItemWithLength_(-1);
bar.button.title = "Deno";

const {
  symbols: {
    _NSConcreteStackBlock,
  },
} = Deno.dlopen("libSystem.dylib", {
  _NSConcreteStackBlock: {
    type: "pointer",
  },
});

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
    {
      name: "applicationDidFinishLaunching:",
      parameters: ["id"],
      result: "void",
      fn(_notif) {
        console.log("Launched 🚀");
        const notificationCenter = UNUserNotificationCenter.alloc()
          .initWithBundleIdentifier("xyz.helloyunho.appkit");

        notificationCenter.getNotificationSettingsWithCompletionHandler(new Block({
          parameters: ["id", "id"],
          result: "void",
          fn(_, settings) {
            console.log(settings);
          },
        }));

        const block = new Block({
          parameters: ["id", "bool", "id"],
          result: "void",
          fn(_, granted: boolean, error: any) {
            console.log("granted:", granted);
            console.log("error:", error);

            if (granted) {
              const content = UNMutableNotificationContent.alloc().init();
              content.title = "Deno";
              content.body = "Deno is awesome";

              const trigger = UNTimeIntervalNotificationTrigger.triggerWithTimeInterval_repeats(5, false);
              
              const request = UNNotificationRequest.requestWithIdentifier_content_trigger(
                "xyz.helloyunho.appkit",
                content,
                trigger,
              );
              
              notificationCenter.addNotificationRequest_withCompletionHandler(
                request,
                new Block({
                  parameters: ["id", "id"],
                  result: "void",
                  fn(_, error: any) {
                    console.log("req error:", objc.send`${error} description`.UTF8String());
                  },
                }),
              );
            }
          },
        });
        
        notificationCenter.requestAuthorizationWithOptions_completionHandler(
          (1 << 0) | (1 << 1) | (1 << 2),
          block,
        );
      },
    },
    {
      name: "OnPopoverClick:",
      parameters: ["id"],
      result: "void",
      fn(_sender) {
        if (bar.button !== null) {
          if (popover.shown) {
            popover.performClose(_sender);
          } else {
            contentViewController.proxy.view.window?.becomeKey();
            popover.showRelativeToRect_ofView_preferredEdge(
              bar.button.bounds,
              bar.button,
              1,
            );
          }
        }
      },
    },
  ],
});

const delegate = WindowDelegate.proxy.alloc().init();
app.setDelegate(delegate);
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

bar.button.setTarget(delegate);
bar.button.setAction("OnPopoverClick:");

window.contentView.addSubview(button1);
window.contentView.addSubview(button2);
window.contentView.addSubview(label1);
window.contentView.addSubview(label2);

app.activateIgnoringOtherApps(true);
app.finishLaunching();

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

while (!close) {
  updateEvents();
}
