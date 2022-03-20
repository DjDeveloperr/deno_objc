// https://developer.apple.com/documentation/objectivec/objective-c_runtime
const lib = Deno.dlopen(
  Deno.build.os === "windows" ? "objc.dll" : "libobjc.dylib",
  {
    // Working with Classes

    class_getName: {
      parameters: ["pointer"],
      result: "pointer",
    },

    class_getSuperclass: {
      parameters: ["pointer"],
      result: "pointer",
    },

    class_isMetaClass: {
      parameters: ["pointer"],
      result: "u8",
    },

    class_getInstanceSize: {
      parameters: ["pointer"],
      result: "usize",
    },

    class_getInstanceVariable: {
      parameters: ["pointer", "pointer"],
      result: "pointer", // ig..? yes
    },

    class_getClassVariable: {
      parameters: ["pointer", "pointer"],
      result: "pointer",
    },

    class_addIvar: {
      parameters: ["pointer", "pointer", "isize", "u8", "pointer"],
      result: "u8",
    },

    class_copyIvarList: {
      parameters: ["pointer", "pointer"],
      result: "pointer",
    },

    class_getIvarLayout: {
      parameters: ["pointer"],
      result: "pointer",
    },

    class_setIvarLayout: {
      parameters: ["pointer", "pointer"],
      result: "void",
    },

    class_getWeakIvarLayout: {
      parameters: ["pointer"],
      result: "pointer",
    },

    class_setWeakIvarLayout: {
      parameters: ["pointer", "pointer"],
      result: "void",
    },

    class_getProperty: {
      parameters: ["pointer", "pointer"],
      result: "pointer",
    },

    class_copyPropertyList: {
      parameters: ["pointer", "pointer"],
      result: "pointer",
    },

    class_addMethod: {
      parameters: ["pointer", "pointer", "pointer", "pointer"],
      result: "u8",
    },

    class_getInstanceMethod: {
      parameters: ["pointer", "pointer"],
      result: "pointer",
    },

    class_getClassMethod: {
      parameters: ["pointer", "pointer"],
      result: "pointer",
    },

    class_copyMethodList: {
      parameters: ["pointer", "pointer"],
      result: "pointer",
    },

    class_replaceMethod: {
      parameters: ["pointer", "pointer", "pointer", "pointer"],
      result: "u8",
    },

    class_getMethodImplementation: {
      parameters: ["pointer", "pointer"],
      result: "pointer",
    },

    // TODO: investigate symbol not found later
    // class_getMethodImplementation_stret: {
    //   parameters: ["pointer", "pointer"],
    //   result: "pointer",
    // },

    class_respondsToSelector: {
      parameters: ["pointer", "pointer"],
      result: "u8",
    },

    class_addProtocol: {
      parameters: ["pointer", "pointer"],
      result: "u8",
    },

    class_addProperty: {
      parameters: ["pointer", "pointer", "pointer", "u32"],
      result: "u8",
    },

    class_replaceProperty: {
      parameters: ["pointer", "pointer", "pointer", "u32"],
      result: "void",
    },

    class_conformsToProtocol: {
      parameters: ["pointer", "pointer"],
      result: "u8",
    },

    class_copyProtocolList: {
      parameters: ["pointer", "pointer"],
      result: "pointer",
    },

    class_getVersion: {
      parameters: ["pointer"],
      result: "i32",
    },

    class_setVersion: {
      parameters: ["pointer", "i32"],
      result: "void",
    },

    // Adding Classes

    objc_allocateClassPair: {
      parameters: ["pointer", "pointer", "isize"],
      result: "pointer",
    },

    objc_disposeClassPair: {
      parameters: ["pointer"],
      result: "void",
    },

    objc_registerClassPair: {
      parameters: ["pointer"],
      result: "void",
    },

    /*objc_duplicateClass: {
      parameters: ["pointer", "pointer", "isize"],
      result: "pointer",
    },*/

    // Working with Instances

    object_getIndexedIvars: {
      parameters: ["pointer"],
      result: "pointer",
    },

    object_getIvar: {
      parameters: ["pointer", "pointer"],
      result: "pointer",
    },

    object_setIvar: {
      parameters: ["pointer", "pointer", "pointer"],
      result: "void",
    },

    object_getClassName: {
      parameters: ["pointer"],
      result: "pointer",
    },

    object_getClass: {
      parameters: ["pointer"],
      result: "pointer",
    },

    object_setClass: {
      parameters: ["pointer", "pointer"],
      result: "void",
    },

    // Obtaining Class Definitions

    objc_getClassList: {
      parameters: ["pointer", "isize"],
      result: "i32",
    },

    objc_copyClassList: {
      parameters: ["pointer"],
      result: "pointer",
    },

    objc_lookUpClass: {
      parameters: ["pointer"],
      result: "pointer",
    },

    objc_getClass: {
      parameters: ["pointer"],
      result: "pointer",
    },

    objc_getRequiredClass: {
      parameters: ["pointer"],
      result: "pointer",
    },

    objc_getMetaClass: {
      parameters: ["pointer"],
      result: "pointer",
    },

    // Working with Instance Variables

    ivar_getName: {
      parameters: ["pointer"],
      result: "pointer",
    },

    ivar_getTypeEncoding: {
      parameters: ["pointer"],
      result: "pointer",
    },

    ivar_getOffset: {
      parameters: ["pointer"],
      result: "isize",
    },

    // Associative References

    objc_setAssociatedObject: {
      parameters: ["pointer", "pointer", "pointer", "u32"],
      result: "void",
    },

    objc_getAssociatedObject: {
      parameters: ["pointer", "pointer"],
      result: "pointer",
    },

    objc_removeAssociatedObjects: {
      parameters: ["pointer"],
      result: "void",
    },

    // Working with Methods

    method_getName: {
      parameters: ["pointer"],
      result: "pointer",
    },

    method_getImplementation: {
      parameters: ["pointer"],
      result: "pointer",
    },

    method_getTypeEncoding: {
      parameters: ["pointer"],
      result: "pointer",
    },

    method_copyReturnType: {
      parameters: ["pointer"],
      result: "pointer",
    },

    method_copyArgumentType: {
      parameters: ["pointer", "u32"],
      result: "pointer",
    },

    method_getReturnType: {
      parameters: ["pointer", "pointer", "isize"],
      result: "void",
    },

    method_getNumberOfArguments: {
      parameters: ["pointer"],
      result: "u32",
    },

    method_getArgumentType: {
      parameters: ["pointer", "u32", "pointer", "isize"],
      result: "void",
    },

    /*method_getDescription: {
      parameters: ["pointer"],
      result: "pointer",
    },*/

    method_setImplementation: {
      parameters: ["pointer", "pointer"],
      result: "void",
    },

    method_exchangeImplementations: {
      parameters: ["pointer", "pointer"],
      result: "void",
    },

    // Working with Libraries

    /*objc_copyImageNames: {
      parameters: ["pointer"],
      result: "pointer",
    },*/

    /*class_getImageName: {
      parameters: ["pointer"],
      result: "pointer",
    },*/

    /*objc_copyClassNamesForImage: {
      parameters: ["pointer", "pointer"],
      result: "pointer",
    },*/

    // Working with Selectors

    sel_getName: {
      parameters: ["pointer"],
      result: "pointer",
    },

    sel_registerName: {
      parameters: ["pointer"],
      result: "pointer",
    },

    sel_getUid: {
      parameters: ["pointer"],
      result: "pointer",
    },

    sel_isEqual: {
      parameters: ["pointer", "pointer"],
      result: "u8",
    },

    // Working with Protocols

    objc_getProtocol: {
      parameters: ["pointer"],
      result: "pointer",
    },

    objc_copyProtocolList: {
      parameters: ["pointer"],
      result: "pointer",
    },

    objc_allocateProtocol: {
      parameters: ["pointer"],
      result: "pointer",
    },

    objc_registerProtocol: {
      parameters: ["pointer"],
      result: "void",
    },

    protocol_addMethodDescription: {
      parameters: ["pointer", "pointer", "pointer", "u8", "u8"],
      result: "void",
    },

    protocol_addProtocol: {
      parameters: ["pointer", "pointer"],
      result: "void",
    },

    protocol_addProperty: {
      parameters: ["pointer", "pointer", "pointer", "u32", "u8", "u8"],
      result: "void",
    },

    protocol_getName: {
      parameters: ["pointer"],
      result: "pointer",
    },

    protocol_isEqual: {
      parameters: ["pointer", "pointer"],
      result: "u8",
    },

    protocol_copyMethodDescriptionList: {
      parameters: ["pointer", "u8", "u8", "pointer"],
      result: "pointer",
    },

    protocol_getMethodDescription: {
      parameters: ["pointer", "pointer", "u8", "u8"],
      result: "pointer",
    },

    protocol_copyPropertyList: {
      parameters: ["pointer", "pointer"],
      result: "pointer",
    },

    protocol_getProperty: {
      parameters: ["pointer", "pointer"],
      result: "pointer",
    },

    protocol_copyProtocolList: {
      parameters: ["pointer", "pointer"],
      result: "pointer",
    },

    protocol_conformsToProtocol: {
      parameters: ["pointer", "pointer"],
      result: "u8",
    },

    // Working with Properties

    property_getName: {
      parameters: ["pointer"],
      result: "pointer",
    },

    property_getAttributes: {
      parameters: ["pointer"],
      result: "pointer",
    },

    property_copyAttributeValue: {
      parameters: ["pointer", "pointer"],
      result: "pointer",
    },

    property_copyAttributeList: {
      parameters: ["pointer", "pointer"],
      result: "pointer",
    },

    // Using Objective-C Language Features

    /*objc_enumerationMutation: {
      parameters: ["pointer"],
      result: "void",
    },

    objc_setEnumerationMutationHandler: {
      parameters: ["pointer"],
      result: "void",
    },*/

    imp_implementationWithBlock: {
      parameters: ["pointer"],
      result: "pointer",
    },

    imp_getBlock: {
      parameters: ["pointer"],
      result: "pointer",
    },

    imp_removeBlock: {
      parameters: ["pointer"],
      result: "void",
    },

    objc_loadWeak: {
      parameters: ["pointer"],
      result: "pointer",
    },

    objc_storeWeak: {
      parameters: ["pointer", "pointer"],
      result: "pointer",
    },

    objc_msgSend: {
      type: "pointer",
    },

    /*objc_msgSendSuper: {
      type: "pointer",
    },*/
  } as const,
);

// Load Foundation by default.
if (Deno.build.os === "darwin") Deno.dlopen("/System/Library/Frameworks/Foundation.framework/Foundation", {});

export default lib.symbols;
