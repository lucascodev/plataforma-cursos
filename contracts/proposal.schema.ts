import { z } from 'zod';
import { courseSlugSchema } from './course-slug.schema';
import { httpsUrlSchema } from './https-url.schema';
import { profileCardSchema } from './profile-card.schema';
import { proposalStatusSchema } from './proposal-status.schema';
import { timestampSchema } from './timestamp.schema';

export const proposalSchema = z.object({
  id: z.guid(),
  status: proposalStatusSchema,
  title: z.string().max(120),
  summary: z.string().max(2000),
  audience: z.string().max(400),
  area: z.string().max(60),
  language: z.string().max(5),
  outline: z.array(z.string().max(120)).max(30),
  experience: z.string().max(2000),
  sampleUrl: httpsUrlSchema.nullable(),
  suggestedSlug: courseSlugSchema.nullable(),
  reviewNote: z.string().max(2000).nullable(),
  reviewedAt: timestampSchema.nullable(),
  courseSlug: courseSlugSchema.nullable(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
  author: profileCardSchema.nullable().optional(),
});

export type ProposalRecord = z.infer<typeof proposalSchema>;
