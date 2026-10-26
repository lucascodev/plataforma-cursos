import { progressLimits } from '@contracts/progress/progress-limits';

export function limitText(text: string): string {
  return text.slice(0, progressLimits.maxTextLength);
}
