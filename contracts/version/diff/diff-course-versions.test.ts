import { describe, expect, it } from 'vitest';
import { nextSemver } from '../next-semver.ts';
import { diffCourseVersions } from './diff-course-versions.ts';

const lesson = (id: string, title = 'Aula') => ({ id, title, summary: 'Resumo.', exercise: 'Faça.' });
const published = {
  slug: 'curso',
  title: 'Curso',
  rhythm: { weekdayHours: 1, saturdayHours: 3, sundayHours: 1 },
  modules: [
    { id: 'm1', shortTitle: 'Base', title: 'Base', lessons: [lesson('t0'), lesson('t1')], drills: [] },
    { id: 'm2', shortTitle: 'RAG', title: 'RAG', lessons: [lesson('t0')], drills: [{ title: 'Sem id', task: 'x' }] },
  ],
};

describe('diffCourseVersions', () => {
  it('sem mudanças, lista vazia', () => {
    expect(diffCourseVersions(published, published)).toEqual({ changes: [], removedItemKeys: [] });
  });

  it('conta aulas novas, removidas e revisadas por módulo', () => {
    const draft = {
      ...published,
      title: 'Curso novo',
      modules: [
        { ...published.modules[0], lessons: [lesson('t0', 'Aula revisada'), lesson('tnova')] },
        published.modules[1],
      ],
    };
    const diff = diffCourseVersions(published, draft);
    expect(diff.changes).toEqual([
      { area: 'info', text: 'Informações: título' },
      { area: 'modules', text: 'M1 · Base: 1 aula nova, 1 aula removida, 1 aula revisada' },
    ]);
    expect(diff.removedItemKeys).toEqual(['m1-t1']);
  });

  it('módulo removido leva junto as chaves de progresso, inclusive as por posição', () => {
    const diff = diffCourseVersions(published, { ...published, modules: [published.modules[0]], rhythm: { weekdayHours: 2 } });
    expect(diff.changes).toEqual([
      { area: 'modules', text: 'Módulo removido: RAG' },
      { area: 'rhythm', text: 'Ritmo e plano alterados' },
    ]);
    expect(diff.removedItemKeys).toEqual(['m2-t0', 'm2-e0']);
  });

  it('primeira versão: tudo é novo', () => {
    expect(diffCourseVersions(null, published).changes.filter((change) => change.text.startsWith('Módulo novo'))).toHaveLength(2);
  });
});

describe('nextSemver', () => {
  it('segue a mesma regra do banco', () => {
    expect(nextSemver(null, 'minor')).toBe('1.0.0');
    expect(nextSemver('1.2.3', 'patch')).toBe('1.2.4');
    expect(nextSemver('1.2.3', 'minor')).toBe('1.3.0');
    expect(nextSemver('1.2.3', 'major')).toBe('2.0.0');
  });
});
