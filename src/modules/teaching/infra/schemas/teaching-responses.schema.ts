import { courseWorkspaceSchema } from '@contracts/teaching/course-workspace.schema';
import { teacherCourseStatsSchema } from '@contracts/teaching/teacher-course-stats.schema';
import { teacherCourseSchema } from '@contracts/teaching/teacher-course.schema';
import { courseVersionWithContentSchema } from '@contracts/version/course-version-with-content.schema';
import { courseVersionSchema } from '@contracts/version/course-version.schema';
import { reviewItemSchema } from '@contracts/version/review-item.schema';
import { z } from 'zod';

// One key per answer of the teaching API, so the gateway reads each response with the matching schema.
export const teachingResponses = {
  courses: z.object({ courses: z.array(teacherCourseSchema).max(200) }),
  workspace: z.object({ workspace: courseWorkspaceSchema }),
  stats: z.object({ stats: teacherCourseStatsSchema }),
  openedDraft: z.object({ version: courseVersionWithContentSchema }),
  savedDraft: z.object({ revision: z.number().int().min(1) }),
  version: z.object({ version: courseVersionSchema }),
  reviewItems: z.object({ reviewItems: z.array(reviewItemSchema).max(20) }),
};
