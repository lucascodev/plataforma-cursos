export function moveEntry<T>(list: readonly T[], index: number, delta: number): readonly T[] {
  const target = index + delta;
  if (index < 0 || index >= list.length || target < 0 || target >= list.length) return list;
  const next = [...list];
  const [entry] = next.splice(index, 1);
  next.splice(target, 0, entry as T);
  return next;
}
