import { assertEquals } from "./deps.ts";
import { CTypeInfo, parseCType } from "../mod.ts";

function assert(source: string, type: CTypeInfo) {
  assertEquals(parseCType(source), type);
}

Deno.test("objc encoding parser", async (t) => {
  await t.step("char", () => {
    assert(
      "c",
      { type: "char" },
    );
  });

  await t.step("int", () => {
    assert(
      "i",
      { type: "int" },
    );
  });

  await t.step("short", () => {
    assert(
      "s",
      { type: "short" },
    );
  });

  await t.step("long", () => {
    assert(
      "l",
      { type: "long" },
    );
  });

  await t.step("long long", () => {
    assert(
      "q",
      { type: "long long" },
    );
  });

  await t.step("unsigned char", () => {
    assert(
      "C",
      { type: "unsigned char" },
    );
  });

  await t.step("unsigned int", () => {
    assert(
      "I",
      { type: "unsigned int" },
    );
  });

  await t.step("unsigned short", () => {
    assert(
      "S",
      { type: "unsigned short" },
    );
  });

  await t.step("unsigned long", () => {
    assert(
      "L",
      { type: "unsigned long" },
    );
  });

  await t.step("unsigned long long", () => {
    assert(
      "Q",
      { type: "unsigned long long" },
    );
  });

  await t.step("float", () => {
    assert(
      "f",
      { type: "float" },
    );
  });

  await t.step("double", () => {
    assert(
      "d",
      { type: "double" },
    );
  });

  await t.step("bool", () => {
    assert(
      "B",
      { type: "bool" },
    );
  });

  await t.step("void", () => {
    assert(
      "v",
      { type: "void" },
    );
  });

  await t.step("string", () => {
    assert(
      "*",
      { type: "string" },
    );
  });

  await t.step("id", () => {
    assert(
      "@",
      { type: "id" },
    );
  });

  await t.step("class", () => {
    assert(
      "#",
      { type: "class" },
    );
  });

  await t.step("sel", () => {
    assert(
      ":",
      { type: "sel" },
    );
  });

  await t.step("pointer", () => {
    assert(
      "^c",
      { type: "pointer", pointeeType: { type: "char" } },
    );
  });

  await t.step("array", () => {
    assert(
      "[24c]",
      { type: "array", length: 24, elementType: { type: "char" } },
    );
  });

  await t.step("struct", () => {
    assert(
      "{name=cisl}",
      {
        type: "struct",
        name: "name",
        fields: [
          { type: "char" },
          { type: "int" },
          { type: "short" },
          { type: "long" },
        ],
      },
    );
  });

  await t.step("unknown", () => {
    assert(
      "?",
      { type: "unknown" },
    );
  });
});
