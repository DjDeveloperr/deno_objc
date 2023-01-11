import { BaseComponent } from "./base.ts";
import objc from "../sys.ts";
import { Signal } from "../deps.ts";
import { Style } from "../style.ts";

const { NSTextField } = objc.classes;

export interface TextProps extends Style {
  children?: any[];
}

export class Text extends BaseComponent {
  constructor(public props: TextProps) {
    super(props);
    this.ns = NSTextField.alloc().init();
    this.ns.wantsLayer = true;
    this.ns.setBezeled(false);
    this.ns.setDrawsBackground(false);
    this.ns.setEditable(false);
    this.ns.setSelectable(false);
    this.ns.alignment = 1;
    this.ns.stringValue = this.props.children?.map((child) => {
      if (child === null || child === undefined) return null;
      if (child instanceof Signal) {
        return child.value;
      }
      return String(child);
    }).filter((e) => e !== null).join("") ?? "";
    this.ns.sizeToFit();
    const [, , width, height] = new Float64Array(this.ns.frame.buffer);
    this.yoga.setWidth(width);
    this.yoga.setHeight(height);
  }

  render() {
    this.ns.setFrame(
      new Float64Array([
        this.yoga.getComputedLeft(),
        this.yoga.getComputedTop(),
        this.yoga.getComputedWidth(),
        this.yoga.getComputedHeight(),
      ]),
    );
    return this.ns;
  }
}
