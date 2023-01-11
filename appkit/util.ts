import objc from "./sys.ts";

const {
  NSApplication,
  NSDate,
  NSObject,
} = objc.classes;

export function NSMakeRect(
  x: number,
  y: number,
  width: number,
  height: number,
) {
  return new Float64Array([x, y, width, height]);
}

export function NSMakeSize(width: number, height: number) {
  return new Float64Array([width, height]);
}

export const NSApp = NSApplication.sharedApplication();
NSApp.setActivationPolicy(0);

const AppDelegate = objc.createClass({
  name: "AppDelegate",
  superclass: NSObject,
  methods: [
    {
      name: "applicationShouldTerminateAfterLastWindowClosed:",
      result: "bool",
      parameters: ["id"],
      fn(_sender) {
        return true;
      },
    },
    {
      name: "applicationWillTerminate:",
      result: "void",
      parameters: ["id"],
      fn(notif) {
        globalThis.dispatchEvent(
          new CustomEvent("terminate", {
            detail: notif,
          }),
        );
        controller.abort();
      },
    },
    {
      name: "applicationDidFinishLaunching:",
      parameters: ["id"],
      result: "void",
      fn(notif) {
        globalThis.dispatchEvent(
          new CustomEvent("launched", {
            detail: notif,
          }),
        );
      },
    },
  ],
}).proxy;
const delegate = AppDelegate.alloc().init();
NSApp.setDelegate(delegate);

export function updateEvents() {
  while (true) {
    const event = NSApp.nextEventMatchingMask_untilDate_inMode_dequeue(
      2n ** 64n - 1n,
      NSDate.distantPast(),
      "kCFRunLoopDefaultMode",
      true,
    );
    if (event) {
      NSApp.sendEvent(event);
    } else {
      break;
    }
  }
}

export const controller = new AbortController();

export function mainloop(innerCallback?: () => void) {
  NSApp.activateIgnoringOtherApps(true);
  NSApp.finishLaunching();
  while (!controller.signal.aborted) {
    innerCallback?.();
    updateEvents();
  }
}
