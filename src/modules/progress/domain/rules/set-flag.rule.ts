import { progressLimits } from '@contracts/progress-limits';

export function setFlag(flags: Readonly<Record<string, true>>, key: string, enabled: boolean): Readonly<Record<string, true>> {
  if (enabled === (key in flags)) return flags;
  if (!enabled) {
    const { [key]: _removed, ...rest } = flags;
    return rest;
  }
  if (Object.keys(flags).length >= progressLimits.maxEntries) return flags;
  return { ...flags, [key]: true };
}
