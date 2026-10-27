import { z } from 'zod';

export const versionImpactSchema = z.object({
  students: z.number().int().min(0),
  // Progress key of each removed lesson or drill -> how many people had completed it.
  completedRemoved: z.record(z.string().max(80), z.number().int().min(0)),
});

export type VersionImpactRecord = z.infer<typeof versionImpactSchema>;
