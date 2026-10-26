import { describe, expect, it } from 'vitest';
import { loadTestCourse } from '@/test/fixtures/load-test-course.fixture';
import { buildStudyPlan } from '../plan/build-study-plan.rule';
import { planWeek } from '../plan/plan-week.rule';
import { findOldestOverdueDay } from './find-oldest-overdue-day.rule';

const plan = buildStudyPlan(loadTestCourse(), '2026-10-26');

describe('dias do plano', () => {
  it('acha o dia em atraso mais antigo', () => {
    const done = new Set(['2026-10-26', '2026-10-27']);
    expect(findOldestOverdueDay(plan, (date) => done.has(date), '2026-10-30')).toBe('2026-10-28');
    expect(findOldestOverdueDay(plan, () => true, '2026-10-30')).toBeNull();
  });

  it('conta a semana a partir do início e limita ao tamanho do plano', () => {
    expect(planWeek(plan, '2026-10-26').week).toBe(1);
    expect(planWeek(plan, '2026-11-02').week).toBe(2);
    expect(planWeek(plan, '2020-01-01').week).toBe(1);
    const last = planWeek(plan, '2099-01-01');
    expect(last.week).toBe(last.totalWeeks);
  });
});
