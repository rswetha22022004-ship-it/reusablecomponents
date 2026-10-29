/**
 * Recursively freezes plain objects and arrays so a configuration can never be
 * mutated by accident at runtime. Functions are left alone.
 * The return type is unchanged so TypeScript inference keeps working.
 */
export function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value as Record<string, unknown>)) {
      deepFreeze(child);
    }
  }
  return value;
}
