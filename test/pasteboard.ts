import objc from "../mod.ts";
import { assert, assertEquals } from "./deps.ts";

objc.import("AppKit");

const {
  NSPasteboard,
} = objc.classes;

const pasteboard = NSPasteboard.generalPasteboard();

Deno.test("pasteboard", async (t) => {
  await t.step("clear contents", () => {
    pasteboard.clearContents();
  });

  await t.step("write string", () => {
    assert(
      pasteboard.setString_forType("hello world", "public.utf8-plain-text"),
    );
  });

  await t.step("read string", () => {
    const str = pasteboard.stringForType("public.utf8-plain-text");
    assertEquals(str, "hello world");
  });
});
