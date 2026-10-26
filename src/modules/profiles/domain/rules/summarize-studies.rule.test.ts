import { describe, expect, it } from 'vitest';
import { summarizeStudies } from './summarize-studies.rule';

describe('summarizeStudies', () => {
  const courses = [{ slug: 'ia', title: 'Engenharia de IA', totalItems: 10 }];

  it('counts completion, projects and study days per course', () => {
    const summary = summarizeStudies(
      [{ courseSlug: 'ia', updatedAt: '2026-11-02', completedItemIds: ['m1-t0', 'm1-t1', 'm1-cp'], studyDayCount: 4 }],
      courses,
    );
    expect(summary).toEqual({
      coursesStarted: 1,
      studyDays: 4,
      projectsDone: 1,
      completedItems: 3,
      courses: [{ slug: 'ia', title: 'Engenharia de IA', percent: 30, completedItems: 3, totalItems: 10, projectsDone: 1, studyDays: 4, updatedAt: '2026-11-02' }],
    });
  });

  it('never passes 100% and keeps courses that left the catalog', () => {
    const summary = summarizeStudies(
      [
        { courseSlug: 'ia', updatedAt: '', completedItemIds: Array.from({ length: 12 }, (_, i) => `m1-t${i}`), studyDayCount: 0 },
        { courseSlug: 'antigo', updatedAt: '', completedItemIds: ['m1-t0'], studyDayCount: 1 },
      ],
      courses,
    );
    expect(summary.courses.map((course) => [course.title, course.percent])).toEqual([
      ['Engenharia de IA', 100],
      ['antigo', 0],
    ]);
  });

  it('ignores courses opened but never studied', () => {
    expect(summarizeStudies([{ courseSlug: 'ia', updatedAt: '', completedItemIds: [], studyDayCount: 0 }], courses).coursesStarted).toBe(0);
  });
});
