import objc from "./sys.ts";
import { NSApp, NSMakeRect } from "./util.ts";

const {
  NSView,
  NSButton,
  NSObject,
  NSWindow,
  NSTextField,
} = objc.classes;

export type Rect = [number, number, number, number];

export interface BaseProps {
  bind?: (value: any) => void;
}

export interface ViewProps extends BaseProps {
  frame: Rect;
}

export function View(props: ViewProps, components: any[]) {
  const view = NSView.alloc().initWithFrame(NSMakeRect(...props.frame));
  for (const component of components) {
    view.addSubview(component);
  }
  props.bind?.(view);
  return view;
}

export interface ButtonProps extends BaseProps {
  frame: Rect;
  title: string;
  bezelStyle?: number;
  autoresizingMask?: number;
  target?: any;
  action?: string;
  onClick?: () => void;
}

let ctr = 0;

export function Button(props: ButtonProps) {
  const button = NSButton.alloc().initWithFrame(NSMakeRect(...props.frame));
  button.setTitle(props.title);
  button.setBezelStyle(props.bezelStyle || 1);
  button.setAutoresizingMask(props.autoresizingMask || (4 | 8));
  if (props.target && props.action) {
    button.setTarget(props.target);
    button.setAction(props.action);
  }
  if (props.onClick) {
    const delegate = objc.createClass({
      name: "_JSXButtonDelegate" + ctr++,
      superclass: NSObject,
      methods: [
        {
          name: "action:",
          parameters: ["id"],
          result: "void",
          fn(_sender) {
            props.onClick?.();
          },
        },
      ],
    }).proxy.alloc().init();
    button.setTarget(delegate);
    button.setAction("action:");
  }
  props.bind?.(button);
  return button;
}

export interface WindowProps extends BaseProps {
  title: string;
  contentRect: Rect;
  styleMask?: number;
}

let windowsOpen = 0;

export function Window(props: WindowProps, components: any[]) {
  const window = NSWindow.alloc().initWithContentRect_styleMask_backing_defer(
    NSMakeRect(...props.contentRect),
    props.styleMask || (1 | 2 | 4),
    2,
    0,
  );
  window.setTitle(props.title);
  window.setReleasedWhenClosed(false);
  window.setAcceptsMouseMovedEvents(true);
  const WindowDelegate = objc.createClass({
    name: "_JSXWindowDelegate" + ctr++,
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
          windowsOpen--;
          if (windowsOpen === 0) {
            NSApp.terminate(window);
          }
        },
      },
    ],
  }).proxy.alloc().init();
  window.setDelegate(WindowDelegate);
  for (const component of components) {
    window.contentView.addSubview(component);
  }
  windowsOpen++;
  props.bind?.(window);
  return window;
}

export interface TextFieldProps extends BaseProps {
  frame: Rect;
  value?: string;
  bezeled?: boolean;
  editable?: boolean;
  drawsBackground?: boolean;
}

export function TextField(props: TextFieldProps) {
  const tf = NSTextField.alloc().initWithFrame(NSMakeRect(...props.frame));
  if (props.value !== undefined) tf.setStringValue(props.value);
  if (props.bezeled !== undefined) tf.setBezeled(props.bezeled);
  if (props.drawsBackground !== undefined) {
    tf.setDrawsBackground(props.drawsBackground);
  }
  if (props.editable !== undefined) tf.setEditable(props.editable);
  props.bind?.(tf);
  return tf;
}

export function useState(init: any) {
  return [
    () => init,
    (value: any) => {
      init = value;
    },
  ] as const;
}

export class AppKit {
  static createElement(
    element: string | CallableFunction,
    props: Record<string, any>,
    ...children: any[]
  ) {
    if (typeof element === "string") {
      throw new Error(`No intrinsic element named "${element}"`);
    } else {
      return element(props, children);
    }
  }
}
