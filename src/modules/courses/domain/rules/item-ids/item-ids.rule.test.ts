import { describe, expect, it } from 'vitest';
import { loadTestCourse } from '@/test/fixtures/load-test-course.fixture';
import type { CourseModule } from '../../entities/course/module/course-module.entity';
import { listModuleItemIds } from './list-module-item-ids.rule';

describe('ids de progresso', () => {
  it('mantém as chaves já salvas para o curso atual (t<índice> e e<índice>)', () => {
    const course = loadTestCourse();
    const [first] = course.modules;
    if (!first) throw new Error('curso sem módulos');
    const ids = listModuleItemIds(first);
    expect(ids[0]).toBe(`${first.id}-t0`);
    expect(ids).toContain(`${first.id}-cp`);
    if (first.drills.length) expect(ids).toContain(`${first.id}-e0`);
  });

  it('usa o id da aula, então reordenar aulas não troca o progresso de lugar', () => {
    const [first] = loadTestCourse().modules;
    if (!first || first.lessons.length < 2) throw new Error('curso sem aulas suficientes');
    const [lessonZero, lessonOne, ...rest] = first.lessons;
    const reordered: CourseModule = { ...first, lessons: [lessonOne!, lessonZero!, ...rest] };
    expect(listModuleItemIds(reordered).slice(0, 2)).toEqual([`${first.id}-t1`, `${first.id}-t0`]);
  });
});
