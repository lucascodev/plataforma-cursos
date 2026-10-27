const ID_LENGTH = 6;
const BASE = 36;

// Lesson ("t…") and drill ("e…") ids are random instead of positional, so reordering never moves anyone's progress.
export function createItemId(prefix: 't' | 'e', takenIds: ReadonlySet<string>, random: () => number): string {
  for (;;) {
    const suffix = Array.from({ length: ID_LENGTH }, () => Math.floor(random() * BASE).toString(BASE)).join('');
    const id = `${prefix}${suffix}`;
    if (!takenIds.has(id)) return id;
  }
}
