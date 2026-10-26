import { describe, expect, it } from 'vitest';
import { loadTestCourse } from '@/test/fixtures/load-test-course.fixture';
import { buildStudyPlan } from './build-study-plan.rule';
import { planSpan } from './plan-span.rule';

describe('planSpan', () => {
  it('conta os dias de estudo e mostra o primeiro e o último', () => {
    const plan = buildStudyPlan(loadTestCourse(), '2026-10-26');
    const span = planSpan(plan);
    expect(span.firstDate).toBe('2026-10-26');
    expect(span.studyDays).toBe(plan.days.length);
    expect(span.lastDate > span.firstDate).toBe(true);
  });
});
