import { z } from 'zod';
import { httpsUrlSchema } from '../url/https-url.schema.ts';

export const profileLinkSchema = z.object({
  label: z.string().trim().min(1).max(40),
  url: httpsUrlSchema,
});

export type ProfileLinkRecord = z.infer<typeof profileLinkSchema>;
