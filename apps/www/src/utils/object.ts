export function deepMerge<T extends object, U extends object>(
  target: T,
  source: U
): T & U {
  const output = Object.assign({}, target);
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        if (!(key in target)) Object.assign(output, { [key]: source[key] });
        else output[key] = deepMerge(target[key], source[key]);
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output as T & U;
}

export function isObject(item: any): boolean {
  return item && typeof item === "object" && !Array.isArray(item);
}
