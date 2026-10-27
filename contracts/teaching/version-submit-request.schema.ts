import { z } from 'zod';
import { submittableVersionKindSchema } from '../version/course-version-kind.schema.ts';

export const versionSubmitRequestSchema = z.object({
  versionId: z.guid(),
  revision: z.number().int().min(1),
  kind: submittableVersionKindSchema,
  message: z.string().trim().max(1000, 'Use até 1000 letras.'),
});

export type VersionSubmitRequestRecord = z.infer<typeof versionSubmitRequestSchema>;
