import { adminCourseSchema } from '@contracts/admin/admin-course.schema';
import { adminNavBadgesSchema } from '@contracts/admin/admin-nav-badges.schema';
import { adminReportSchema } from '@contracts/admin/admin-report.schema';
import { attentionItemSchema } from '@contracts/admin/attention-item.schema';
import { versionImpactSchema } from '@contracts/admin/version-impact.schema';
import { adminOverviewSchema } from '@contracts/admin/admin-overview.schema';
import { adminPersonListSchema } from '@contracts/admin/admin-person-list.schema';
import { adminVersionDetailSchema } from '@contracts/admin/admin-version-detail.schema';
import { auditPageSchema } from '@contracts/admin/audit-page.schema';
import { courseSlugSchema } from '@contracts/course/course-slug.schema';
import { proposalListSchema } from '@contracts/proposal/proposal-list.schema';
import { proposalSchema } from '@contracts/proposal/proposal.schema';
import { courseVersionSchema } from '@contracts/version/course-version.schema';
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
  versions: z.object({ versions: z.array(courseVersionSchema).max(500) }),
  version: adminVersionDetailSchema,
  badges: z.object({ badges: adminNavBadgesSchema }),
  attention: z.object({ items: z.array(attentionItemSchema).max(30) }),
  slug: z.object({ available: z.boolean() }),
  impact: z.object({ impact: versionImpactSchema }),
  reports: z.object({ reports: z.array(adminReportSchema).max(200) }),
};
