import { describe, expect, it } from 'vitest';
import { canEditVersion } from './version/can-edit-version.rule';
import { countOpenReviewItems } from './version/count-open-review-items.rule';
import { createItemId } from './draft/create-item-id.rule';
import { createModule } from './draft/create-module.rule';
import { normalizeCourseDraft } from './draft/normalize-course-draft.rule';
import { weeklyHours } from './draft/weekly-hours.rule';
import { moveEntry } from './list/move-entry.rule';

describe('normalizeCourseDraft', () => {
  it('rascunho recém-aprovado ganha todos os campos, vazios', () => {
    const course = normalizeCourseDraft({ slug: 'k8s', title: 'Kubernetes', modules: [{ id: 'm1', title: 'Pods' }] }, '2026-10-28');
    expect(course.version).toBe('0.1.0');
    expect(course.updatedAt).toBe('2026-10-28');
    expect(course.rhythm).toEqual({ weekdayHours: 1, saturdayHours: 3, sundayHours: 1 });
    expect(course.modules[0]).toMatchObject({ id: 'm1', title: 'Pods', kind: 'standard', months: 1, lessons: [], project: { requirements: [] } });
  });

  it('aulas sem id recebem o id por posição, o mesmo do progresso salvo', () => {
    const course = normalizeCourseDraft({ modules: [{ id: 'm1', lessons: [{ title: 'A' }, { id: 'tabc', title: 'B' }], drills: [{ title: 'D' }] }] }, '2026-10-28');
    expect(course.modules[0]?.lessons.map((lesson) => lesson.id)).toEqual(['t0', 'tabc']);
    expect(course.modules[0]?.drills[0]?.id).toBe('e0');
  });

  it('valores de tipo errado viram o padrão', () => {
    const course = normalizeCourseDraft({ title: 3, modules: [{ kind: 'outro', months: 'dois' }] }, '2026-10-28');
    expect(course.title).toBe('');
    expect(course.modules[0]).toMatchObject({ id: 'm1', kind: 'standard', months: 1 });
  });
});

describe('ids e módulos novos', () => {
  it('id novo nunca repete um que já existe', () => {
    const values = [0, 0, 0, 0, 0, 0, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5];
    const random = () => values.shift() ?? 0.9;
    expect(createItemId('t', new Set(['t000000']), random)).toBe('tiiiiii');
  });

  it('módulo novo pega o próximo id livre', () => {
    const existing = [createModule([]), { ...createModule([]), id: 'm2' }];
    expect(createModule(existing).id).toBe('m3');
    expect(createModule([{ ...createModule([]), id: 'm2' }]).id).toBe('m3');
  });
});

describe('regras do editor', () => {
  it('mover troca a posição e ignora o que sai da lista', () => {
    expect(moveEntry(['a', 'b', 'c'], 0, 1)).toEqual(['b', 'a', 'c']);
    expect(moveEntry(['a', 'b'], 0, -1)).toEqual(['a', 'b']);
  });

  it('só rascunho e ajustes pedidos podem ser editados', () => {
    expect(canEditVersion({ status: 'draft' })).toBe(true);
    expect(canEditVersion({ status: 'changes_requested' })).toBe(true);
    expect(canEditVersion({ status: 'in_review' })).toBe(false);
  });

  it('conta ajustes ainda não feitos e horas da semana', () => {
    expect(countOpenReviewItems({ reviewItems: [{ id: 'r1', text: 'a', resolved: true }, { id: 'r2', text: 'b', resolved: false }] })).toBe(1);
    expect(weeklyHours({ weekdayHours: 1, saturdayHours: 3, sundayHours: 1 })).toBe(9);
  });
});
