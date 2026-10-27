import { z } from 'zod';
import { courseSlugSchema } from '../course/course-slug.schema.ts';
import { httpsUrlSchema } from '../url/https-url.schema.ts';
import { profileCardSchema } from '../profile/profile-card.schema.ts';
import { proposalDurationSchema } from './proposal-duration.schema.ts';
import { proposalLevelSchema } from './proposal-level.schema.ts';
import { proposalStatusSchema } from './proposal-status.schema.ts';
import { timestampSchema } from '../date/timestamp.schema.ts';

export const proposalSchema = z.object({
  id: z.guid(),
  status: proposalStatusSchema,
  title: z.string().max(120),
  summary: z.string().max(2000),
  audience: z.string().max(400),
  area: z.string().max(60),
  language: z.string().max(5),
  level: proposalLevelSchema.nullable().default(null),
  duration: proposalDurationSchema.nullable().default(null),
  outline: z.array(z.string().max(120)).max(30),
  experience: z.string().max(2000),
  sampleUrl: httpsUrlSchema.nullable(),
  suggestedSlug: courseSlugSchema.nullable(),
  commitmentsAcceptedAt: timestampSchema.nullable().default(null),
  reviewNote: z.string().max(2000).nullable(),
  reviewedAt: timestampSchema.nullable(),
  courseSlug: courseSlugSchema.nullable(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
  author: profileCardSchema.nullable().optional(),
});

export type ProposalRecord = z.infer<typeof proposalSchema>;
