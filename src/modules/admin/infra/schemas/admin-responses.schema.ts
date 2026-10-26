import { adminCourseSchema } from '@contracts/admin-course.schema';
import { adminOverviewSchema } from '@contracts/admin-overview.schema';
import { adminPersonListSchema } from '@contracts/admin-person-list.schema';
import { auditPageSchema } from '@contracts/audit-page.schema';
import { courseSlugSchema } from '@contracts/course-slug.schema';
import { proposalListSchema } from '@contracts/proposal-list.schema';
import { proposalSchema } from '@contracts/proposal.schema';
import { z } from 'zod';

// One object, one key per answer of the admin API, so the gateway reads each response with the matching schema.
export const adminResponses = {
  overview: z.object({ overview: adminOverviewSchema }),
  proposals: proposalListSchema,
  proposal: z.object({ proposal: proposalSchema }),
  approval: z.object({ courseSlug: courseSlugSchema }),
  courses: z.object({ courses: z.array(adminCourseSchema).max(1000) }),
  people: adminPersonListSchema,
  audit: auditPageSchema,
};
