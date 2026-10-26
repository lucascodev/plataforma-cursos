import { describe, expect, it } from 'vitest';
import { listModuleItemIds } from '../item-ids/list-module-item-ids.rule';
import { buildStudyPlan } from '../plan/build-study-plan.rule';
import { loadTestCourse } from '@/test/fixtures/load-test-course.fixture';
import { calculateCourseCompletion } from './completion/calculate-course-completion.rule';
import { calculateMonthsElapsed } from './pace/calculate-months-elapsed.rule';
import { calculatePace } from './pace/calculate-pace.rule';
import { findCurrentModuleIndex } from './completion/find-current-module-index.rule';
import { summarizeCourseTotals } from './summarize-course-totals.rule';
import { summarizeStudyDays } from './summarize-study-days.rule';

const course = loadTestCourse();
const nothingDone = () => false;

describe('course summary rules', () => {
  it('summarizes the course totals', () => {
    const totals = summarizeCourseTotals(course);
    expect(totals).toMatchObject({ modules: 9, lessons: 75, drills: 38, projects: 7, hasCapstone: true, weeklyHours: 9 });
    expect(totals.hours).toBe(totals.weeks * 9);
  });

  it('computes completion and the current module', () => {
    const firstModuleItems = new Set(listModuleItemIds(course.modules[0]!));
    const isCompleted = (itemId: string) => firstModuleItems.has(itemId);
    expect(calculateCourseCompletion(course, nothingDone).percent).toBe(0);
    expect(findCurrentModuleIndex(course, nothingDone)).toBe(0);
    expect(findCurrentModuleIndex(course, isCompleted)).toBe(1);
  });

  it('compares progress with the plan', () => {
    expect(calculatePace(course, nothingDone, 0)).toEqual({ status: 'on-track', items: 0 });
    expect(calculatePace(course, nothingDone, 2).status).toBe('behind');
    const firstModuleItems = new Set(listModuleItemIds(course.modules[0]!));
    expect(calculatePace(course, (itemId) => firstModuleItems.has(itemId), 0.5).status).toBe('ahead');
  });

  it('clamps the elapsed months', () => {
    expect(calculateMonthsElapsed('2026-10-26', '2026-10-01', 15)).toBe(0);
    expect(calculateMonthsElapsed('2026-10-26', '2030-01-01', 15)).toBe(15);
  });

  it('counts done, late and streak days', () => {
    const plan = buildStudyPlan(course, '2026-10-26');
    const done = new Set(['2026-10-26', '2026-10-28', '2026-10-29']);
    const summary = summarizeStudyDays(plan, (date) => done.has(date), '2026-10-30');
    expect(summary).toMatchObject({ completed: 3, late: 1, streak: 2 });
  });
});
