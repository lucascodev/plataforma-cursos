export function replaceEntry<T>(list: readonly T[], index: number, entry: T): T[] {
  return list.map((current, position) => (position === index ? entry : current));
}
