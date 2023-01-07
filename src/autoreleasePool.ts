import sys from "./bindings.ts";

export function autoreleasePoolPush() {
  return sys.objc_autoreleasePoolPush();
}

export function autoreleasePoolPop(pool: Deno.PointerValue) {
  sys.objc_autoreleasePoolPop(pool);
}

/**
 * Wrap a callback in an autorelease pool.
 */
export function autoreleasepool(callback: () => void) {
  const pool = autoreleasePoolPush();
  callback();
  autoreleasePoolPop(pool);
}
