import { z } from 'zod';

export const versionPublishRequestSchema = z.object({
  revision: z.number().int().min(1),
  releaseNote: z.string().trim().max(2000, 'Use até 2000 letras.'),
});

export type VersionPublishRequestRecord = z.infer<typeof versionPublishRequestSchema>;
