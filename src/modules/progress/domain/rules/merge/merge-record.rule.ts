// Three-way merge of one map: start from the remote copy and re-apply only the keys this tab changed since base.
export function mergeRecord<T>(base: Readonly<Record<string, T>>, local: Readonly<Record<string, T>>, remote: Readonly<Record<string, T>>): Record<string, T> {
  const merged: Record<string, T> = { ...remote };
  for (const key of new Set([...Object.keys(base), ...Object.keys(local)])) {
    if (local[key] === base[key]) continue;
    const value = local[key];
    if (value === undefined) delete merged[key];
    else merged[key] = value;
  }
  return merged;
}
