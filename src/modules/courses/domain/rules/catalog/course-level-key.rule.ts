import { foldAccents } from '@/shared/utils/text/fold-accents';
import type { CourseLevelKey } from '../../types/course-level-key.type';

const LEVEL_KEYS: readonly CourseLevelKey[] = ['iniciante', 'intermediario', 'avancado'];

// The course level is free text written by the teacher ("Intermediário", "intermediario"), so it is matched by its first word.
export function courseLevelKey(level: string): CourseLevelKey | null {
  const firstWord = foldAccents(level).trim().split(/\s+/)[0] ?? '';
  return LEVEL_KEYS.find((key) => firstWord.startsWith(key)) ?? null;
}
