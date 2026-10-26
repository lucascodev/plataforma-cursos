const COMBINING_MARKS = /[\u0300-\u036f]/g;

export function foldAccents(text: string): string {
  return text.normalize('NFD').replace(COMBINING_MARKS, '').toLowerCase();
}
