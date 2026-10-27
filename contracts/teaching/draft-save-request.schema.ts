import { z } from 'zod';
import { courseDraftContentSchema } from '../version/course-draft-content.schema.ts';

export const draftSaveRequestSchema = z.object({
  versionId: z.guid(),
  revision: z.number().int().min(1),
  content: courseDraftContentSchema,
});

export type DraftSaveRequestRecord = z.infer<typeof draftSaveRequestSchema>;
