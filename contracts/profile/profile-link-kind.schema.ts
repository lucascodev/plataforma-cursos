import { z } from 'zod';

export const profileLinkKindSchema = z.enum(['site', 'linkedin', 'github', 'other']);

export type ProfileLinkKind = z.infer<typeof profileLinkKindSchema>;
