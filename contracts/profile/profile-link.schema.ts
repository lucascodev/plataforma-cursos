import { z } from 'zod';
import { httpsUrlSchema } from '../url/https-url.schema.ts';
import { profileLinkKindSchema } from './profile-link-kind.schema.ts';

export const profileLinkSchema = z.object({
  label: z.string().trim().min(1).max(40),
  url: httpsUrlSchema,
  // Optional: links saved before kinds existed have none.
  kind: profileLinkKindSchema.optional(),
});

export type ProfileLinkRecord = z.infer<typeof profileLinkSchema>;
