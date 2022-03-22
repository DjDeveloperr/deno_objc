import objc from "../mod.ts";

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
    pasteboard.setString_forType("hello world", "public.utf8-plain-text");
  });
});
