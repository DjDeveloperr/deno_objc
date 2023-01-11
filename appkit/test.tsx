/** @jsx AppKit.createElement */

import {
  AppKit,
  mainloop,
  NSApp,
  NSMakeRect,
  objc,
  Text,
  View,
} from "./mod.ts";
import { Yoga } from "./deps.ts";

function ContentView() {
  return (
    <View
      display="flex"
      justifyContent="center"
      alignItems="center"
      width={800}
      height={600}
    >
      <Text>Hello World</Text>
    </View>
  );
}

const { NSWindow, NSObject } = objc.classes;

const window = NSWindow.alloc().initWithContentRect_styleMask_backing_defer(
  NSMakeRect(0, 0, 800, 600),
  1 | 2 | 4,
  2,
  0,
);
window.setTitle("Hello World");
window.setReleasedWhenClosed(false);
window.setAcceptsMouseMovedEvents(true);
const WindowDelegate = objc.createClass({
  name: "MyWindowDelegate",
  superclass: NSObject,
  methods: [
    {
      name: "windowShouldClose:",
      parameters: ["id"],
      result: "bool",
      fn(_sender) {
        return true;
      },
    },
    {
      name: "windowWillClose:",
      parameters: ["id"],
      result: "void",
      fn(_notif) {
        NSApp.terminate(window);
      },
    },
  ],
}).proxy.alloc().init();
window.setDelegate(WindowDelegate);

const contentView = ContentView();
contentView.yoga.calculateLayout(
  Yoga.UNIT_UNDEFINED,
  Yoga.UNIT_UNDEFINED,
  Yoga.DIRECTION_LTR,
);
console.log("computed layout", contentView.yoga.getComputedLayout());
window.contentView = contentView.render();

window.makeKeyAndOrderFront(window);

mainloop();
