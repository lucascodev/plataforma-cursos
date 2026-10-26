import { describe, expect, it } from 'vitest';
import { courseContentSchema } from './course-content.schema.ts';

type Lesson = { id?: string; title: string; summary: string; exercise: string };

const lesson = (title: string, id?: string): Lesson => ({ ...(id ? { id } : {}), title, summary: 'Resumo.', exercise: 'Exercício.' });

function courseWith(lessons: Lesson[]) {
  return {
    slug: 'curso',
    title: 'Curso',
    tagline: 'Chamada.',
    description: 'Descrição.',
    level: 'Iniciante',
    audience: 'Todos',
    version: '1.0.0',
    updatedAt: '2026-10-27',
    rhythm: { weekdayHours: 1, saturdayHours: 3, sundayHours: 1 },
    kickoff: { title: 'Início', detail: 'Prepare o ambiente.' },
    modules: [
      {
        id: 'm1',
        shortTitle: 'M1',
        title: 'Módulo 1',
        kind: 'standard',
        months: 1,
        prerequisite: 'Nada.',
        goal: 'Aprender.',
        caseStudy: 'Caso.',
        lessons,
        drills: [{ title: 'Fixação', task: 'Faça.' }],
        project: { title: 'Projeto', brief: 'Construa.', requirements: ['Funciona'], doneCriteria: ['Publicado'] },
        selfCheck: ['Entendi?'],
        resources: [],
      },
    ],
  };
}

describe('courseContentSchema: ids de aulas e exercícios', () => {
  it('aceita aulas sem id, escritas antes dos ids existirem', () => {
    expect(courseContentSchema.safeParse(courseWith([lesson('A'), lesson('B')])).success).toBe(true);
  });

  it('aceita ids explícitos e únicos', () => {
    expect(courseContentSchema.safeParse(courseWith([lesson('A', 'tabc'), lesson('B', 'txyz')])).success).toBe(true);
  });

  it('recusa dois itens com o mesmo id no módulo', () => {
    const result = courseContentSchema.safeParse(courseWith([lesson('A', 'tabc'), lesson('B', 'tabc')]));
    expect(result.success).toBe(false);
    expect(result.error?.issues.some((issue) => issue.message.includes('mesmo id'))).toBe(true);
  });

  it('recusa id explícito que colide com o id padrão de outra aula', () => {
    expect(courseContentSchema.safeParse(courseWith([lesson('A', 't1'), lesson('B')])).success).toBe(false);
  });

  it('recusa id fora do formato', () => {
    expect(courseContentSchema.safeParse(courseWith([lesson('A', 'aula-1')])).success).toBe(false);
  });
});
