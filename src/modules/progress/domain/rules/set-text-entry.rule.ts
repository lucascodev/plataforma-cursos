import { progressLimits } from '@contracts/progress-limits';
import { limitText } from './limit-text.rule';

export function setTextEntry(entries: Readonly<Record<string, string>>, key: string, text: string): Readonly<Record<string, string>> {
  if (!text.trim()) {
    const { [key]: _removed, ...rest } = entries;
    return rest;
  }
  if (!(key in entries) && Object.keys(entries).length >= progressLimits.maxEntries) return entries;
  return { ...entries, [key]: limitText(text) };
}
