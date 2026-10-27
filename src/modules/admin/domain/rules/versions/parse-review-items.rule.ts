const MAX_ITEMS = 20;

// One point per line, so the reviewer can paste a list. Blank lines and list markers are dropped.
export function parseReviewItems(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, '').trim())
    .filter(Boolean)
    .slice(0, MAX_ITEMS);
}
