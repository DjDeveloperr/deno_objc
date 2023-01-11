import { Yoga } from "../deps.ts";
import { Style } from "../style.ts";

export class BaseComponent {
  ns: any;
  yoga: Yoga.YogaNode;

  constructor(public props: Style) {
    this.yoga = Yoga.Node.create();
    this.yoga.setDisplay(props.display === "none" ? Yoga.DISPLAY_NONE : Yoga.DISPLAY_FLEX);
    this.yoga.setFlexDirection(props.flexDirection === "column" ? Yoga.FLEX_DIRECTION_COLUMN : Yoga.FLEX_DIRECTION_ROW);
    this.yoga.setJustifyContent(props.justifyContent === "center" ? Yoga.JUSTIFY_CENTER : Yoga.JUSTIFY_FLEX_START);
    this.yoga.setAlignItems(props.alignItems === "center" ? Yoga.ALIGN_CENTER : Yoga.ALIGN_FLEX_START);
    this.yoga.setAlignContent(props.alignContent === "center" ? Yoga.ALIGN_CENTER : Yoga.ALIGN_FLEX_START);
    this.yoga.setFlexWrap(props.flexWrap === "wrap" ? Yoga.WRAP_WRAP : Yoga.WRAP_NO_WRAP);
    if (props.width) this.yoga.setWidth(props.width);
    if (props.height) this.yoga.setHeight(props.height);
  }

  render() {
    return null;
  }
}
