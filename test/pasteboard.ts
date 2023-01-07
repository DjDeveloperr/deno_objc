import objc from "../mod.ts";
import { assertEquals } from "./deps.ts";

objc.import("AppKit");

const {
  NSPasteboard,
} = objc.classes;

Deno.test("pasteboard", async (t) => {
  const pb = NSPasteboard.generalPasteboard();

  await t.step("clear contents", () => {
    pb.clearContents();
  });

  await t.step("write string", () => {
    objc
      .send`${pb} setString:${"hello world"} forType:${"public.utf8-plain-text"}`;
    // or
    // pb.setString_forType("hello world", "public.utf8-plain-text");
  });

  await t.step("read string", () => {
    const str = pb.stringForType("public.utf8-plain-text").UTF8String();
    assertEquals(str, "hello world");
  });
});
