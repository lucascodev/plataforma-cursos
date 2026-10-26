export function mergeValue<T>(base: T, local: T, remote: T): T {
  return local === base ? remote : local;
}
