export class AppKit {
  static createElement(
    element: any,
    props: Record<string, any>,
    ...children: any[]
  ) {
    if (typeof element === "string") {
      throw new Error(`No intrinsic element named "${element}"`);
    } else {
      return new element(Object.assign({}, props, { children }));
    }
  }
}
