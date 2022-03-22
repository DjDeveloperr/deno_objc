# deno_objc

Objective-C -> JavaScript bridge for Deno.

```ts
import objc from "https://deno.land/x/objc@0.0.1/mod.ts";

objc.import("AppKit");

const { NSPasteboard } = objc.classes;

const pasteboard = NSPasteboard.generalPasteboard();

const result = pasteboard.stringForType("public.utf8-plain-text");
// or
const result = objc.send
  `${pasteboard} stringForType:${"public.utf8-plain-text"}`;

// Convert to JS String
console.log(result.UTF8String());
```

## Usage

This is mainly for interfacing with macOS Frameworks, but it can also be used
with GNUstep libobjc2.

By default, `libobjc.dylib`, `libobjc.so` or `objc.dll` will be loaded depending
on the platform.

If you want to override that, use `DENO_OBJC_PATH` env variable.

## API

Objective-C runtime is mainly used via message sending. In Obj-C, take the
following method:

```cpp
- (void)setString:(NSString *)string;
```

Now to send it, you do

```cpp
[self setString:@"Hello World"];
```

But in JavaScript, you can do it in two ways. One is using the proxied method:

```js
self.setString_("Hello World");
// or
self.setString("Hello World");
```

Note: The `_` at end is optional and will be inserted automatically if needed.
You can also just use `:` but you will have to wrap it in a string because of
limitations of JavaScript naming:

```js
self["setString:"]("Hello World");
```

Alternative way is to use `objc.send`:

```js
objc.send`${self} setString:${"Hello World"}`;
```

When sending a message, the types of course need to be converted into native
ones. For example, by default the native string type in Obj-C is actually just
null terminated C string. So the JS string will be converted to that if the
method needs.

Otherwise, if we find that the method takes an `id` type, we will try to convert
it to `NSString` instead.

Importing frameworks at runtime is done via `NSBundle`. By default, only
`Foundation` framework is loaded.

## Security

Since this module makes heavy use of FFI, it is inherently unsafe and gives
access to low level system primitives.

As such, to use this module you need to pass these flags:

- `--allow-env`: To check for a possible `DENO_OBJC_PATH` value
- `--allow-ffi`: To load ObjC runtime dynamic library
- `--unstable`: The FFI API in Deno is an unstable API (it can change)

The allow-ffi permission basically breaks through entire security sandbox, so
you can also just pass `-A`/`--allow-all`.

## License

Apache-2.0 licensed.

Copyright 2022 © DjDeveloperr
