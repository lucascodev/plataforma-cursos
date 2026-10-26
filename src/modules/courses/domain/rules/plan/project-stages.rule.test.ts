import { describe, expect, it } from 'vitest';
import { loadTestCourse } from '@/test/fixtures/load-test-course.fixture';
import { buildStudyPlan } from './build-study-plan.rule';
import { projectStages } from './project-stages.rule';

describe('projectStages', () => {
  it('lista as etapas do projeto do módulo na ordem, com datas e dias', () => {
    const stages = projectStages(buildStudyPlan(loadTestCourse(), '2026-10-26'), 0);
    expect(stages.map((stage) => stage.kind)).toEqual(['project-plan', 'project-build', 'project-evaluate', 'project-publish']);
    expect(stages.every((stage) => stage.firstDate <= stage.lastDate && stage.days >= 1)).toBe(true);
    expect(stages[0]!.lastDate < stages[3]!.firstDate).toBe(true);
  });
});
