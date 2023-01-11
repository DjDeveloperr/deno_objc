/**
 * const button = NSButton.alloc().initWithFrame(NSMakeRect(...props.frame));
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
 */
