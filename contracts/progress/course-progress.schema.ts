import { z } from 'zod';
import { isDateKey } from '../date/is-date-key.ts';
import { progressLimits } from './progress-limits.ts';

const dateKey = z.string().refine(isDateKey, 'Data inválida.');
const itemId = z.string().regex(/^[a-z0-9-]{1,60}-(t[a-z0-9]{1,12}|e[a-z0-9]{1,12}|cp)$/);
const moduleId = z.string().regex(/^[a-z0-9-]{1,60}$/);
const entryText = z.string().max(progressLimits.maxTextLength);
const withinEntryLimit = (record: Record<string, unknown>) => Object.keys(record).length <= progressLimits.maxEntries;

export const courseProgressSchema = z.object({
  completedItems: z.record(itemId, z.literal(true)).refine(withinEntryLimit),
  studyDays: z.record(dateKey, z.literal(true)).refine(withinEntryLimit),
  moduleNotes: z.record(moduleId, entryText).refine(withinEntryLimit),
  journal: z.record(dateKey, entryText).refine(withinEntryLimit),
  startDate: dateKey.nullable(),
  startDateSource: z.enum(['suggested', 'user']).nullable(),
  updatedAt: z.string().max(40).nullable(),
});

export type CourseProgressRecord = z.infer<typeof courseProgressSchema>;
