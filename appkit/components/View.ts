import { BaseComponent } from "./base.ts";
import { Style } from "../style.ts";
import objc from "../sys.ts";

const { NSView } = objc.classes;

export interface ViewProps extends Style {
  children?: BaseComponent[];
}

export class View extends BaseComponent {
  ns: any;

  constructor(public props: ViewProps) {
    super(props);
    this.ns = NSView.alloc().init();
    this.ns.wantsLayer = true;

    if (props.children) {
      props.children.forEach((child) => this.appendChild(child));
    }
  }

  render() {
    this.props.children?.forEach((child) => {
      child.render();
    });
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

  appendChild(child: BaseComponent): void {
    this.yoga.insertChild(child.yoga, this.yoga.getChildCount());
    this.ns.addSubview(child.ns);
  }
}
