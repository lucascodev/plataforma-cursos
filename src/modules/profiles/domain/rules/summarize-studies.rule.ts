import type { StudyCourseInfo } from '../entities/study-course-info.entity';
import type { StudyCourseSummary } from '../entities/study-course-summary.entity';
import type { StudyProgressInfo } from '../entities/study-progress-info.entity';
import type { StudySummary } from '../entities/study-summary.entity';

const PROJECT_SUFFIX = '-cp';

// Progress for a course that left the catalog still counts, with its slug as the title.
// Items removed from a course may stay in the progress, so the percentage never goes past 100.
export function summarizeStudies(progress: readonly StudyProgressInfo[], courses: readonly StudyCourseInfo[]): StudySummary {
  const bySlug = new Map(courses.map((course) => [course.slug, course]));
  const summaries: StudyCourseSummary[] = progress
    .filter((entry) => entry.completedItemIds.length > 0 || entry.studyDayCount > 0)
    .map((entry) => {
      const course = bySlug.get(entry.courseSlug);
      const totalItems = course?.totalItems ?? 0;
      const completedItems = entry.completedItemIds.length;
      return {
        slug: entry.courseSlug,
        title: course?.title ?? entry.courseSlug,
        percent: totalItems > 0 ? Math.min(100, Math.round((completedItems / totalItems) * 100)) : 0,
        completedItems,
        totalItems,
        projectsDone: entry.completedItemIds.filter((id) => id.endsWith(PROJECT_SUFFIX)).length,
        studyDays: entry.studyDayCount,
        updatedAt: entry.updatedAt,
      };
    });
  return {
    coursesStarted: summaries.length,
    studyDays: summaries.reduce((sum, course) => sum + course.studyDays, 0),
    projectsDone: summaries.reduce((sum, course) => sum + course.projectsDone, 0),
    completedItems: summaries.reduce((sum, course) => sum + course.completedItems, 0),
    courses: summaries,
  };
}
