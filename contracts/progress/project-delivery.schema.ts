import { z } from 'zod';
import { httpsUrlSchema } from '../url/https-url.schema.ts';

export const PROJECT_METRICS_MAX_LENGTH = 1000;

export const projectDeliverySchema = z.object({
  repoUrl: httpsUrlSchema,
  demoUrl: httpsUrlSchema.nullable(),
  metrics: z.string().trim().max(PROJECT_METRICS_MAX_LENGTH),
  deliveredAt: z.string().max(40),
});

export type ProjectDeliveryRecord = z.infer<typeof projectDeliverySchema>;
