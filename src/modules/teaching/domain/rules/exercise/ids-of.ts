export function idsOf(items: readonly { readonly id: string }[]): ReadonlySet<string> {
  return new Set(items.map((item) => item.id));
}
