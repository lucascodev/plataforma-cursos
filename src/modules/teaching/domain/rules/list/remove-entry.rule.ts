export function removeEntry<T>(list: readonly T[], index: number): T[] {
  return list.filter((_, position) => position !== index);
}
