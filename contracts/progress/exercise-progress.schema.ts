import { z } from 'zod';
import { httpsUrlSchema } from '../url/https-url.schema.ts';

const partId = z.string().regex(/^[qopc][a-z0-9]{1,12}$/);
const MAX_SOURCE = 20_000;

// What a person did in one exercise. Every field has a default so rows saved before a field existed still parse.
export const exerciseProgressSchema = z.object({
  stepsDone: z.array(partId).max(20).default([]),
  criteriaDone: z.array(z.number().int().min(0).max(9)).max(10).default([]),
  answers: z.record(partId, partId).refine((answers) => Object.keys(answers).length <= 20).default({}),
  attempts: z.number().int().min(0).max(10_000).default(0),
  passedChecks: z.array(partId).max(15).default([]),
  hintsOpened: z.number().int().min(0).max(5).default(0),
  code: z.string().max(MAX_SOURCE).nullable().default(null),
  files: z
    .record(z.string().regex(/^[A-Za-z0-9_.-]{1,60}$/), z.string().max(MAX_SOURCE))
    .refine((files) => Object.keys(files).length <= 10)
    .default({}),
  deliveryUrl: httpsUrlSchema.nullable().default(null),
  deliveryText: z.string().max(2000).default(''),
  completedAt: z.string().max(40).nullable().default(null),
});

export type ExerciseProgressRecord = z.infer<typeof exerciseProgressSchema>;
