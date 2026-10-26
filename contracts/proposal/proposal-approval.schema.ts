import { z } from 'zod';
import { courseSlugSchema } from '../course/course-slug.schema.ts';

export const proposalApprovalSchema = z.object({
  slug: courseSlugSchema,
  note: z.string().trim().max(2000),
});

export type ProposalApprovalRecord = z.infer<typeof proposalApprovalSchema>;
