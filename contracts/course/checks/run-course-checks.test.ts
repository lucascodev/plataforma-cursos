import { describe, expect, it } from 'vitest';
import { describeCoursePath } from './describe-course-path.ts';
import { runCourseChecks } from './run-course-checks.ts';

const module = {
  id: 'm1',
  shortTitle: 'Base',
  title: 'Módulo base',
  kind: 'standard',
  months: 1,
  prerequisite: 'Nada.',
  goal: 'Aprender.',
  caseStudy: 'Caso.',
  lessons: [{ id: 't0', title: 'Aula', summary: 'Resumo.', exercise: 'Faça.' }],
  drills: [{ id: 'e0', title: 'Fixação', task: 'Faça.' }],
  project: { title: 'Projeto', brief: 'Construa.', requirements: ['Funciona'], doneCriteria: ['Publicado'] },
  selfCheck: ['Entendi?'],
  resources: [{ type: 'doc', label: 'Docs', url: 'https://example.com' }],
};

const course = {
  slug: 'curso',
  title: 'Curso',
  tagline: 'Chamada.',
  description: 'D'.repeat(220),
  level: 'Iniciante',
  audience: 'Todos',
  version: '0.1.0',
  updatedAt: '2026-10-28',
  rhythm: { weekdayHours: 1, saturdayHours: 3, sundayHours: 1 },
  kickoff: { title: 'Início', detail: 'Prepare o ambiente.' },
  modules: [module],
  guide: { sections: [{ title: 'Como estudar', items: ['Siga o plano.'] }] },
};

describe('runCourseChecks', () => {
  it('curso completo passa sem erros nem avisos', () => {
    expect(runCourseChecks(course)).toEqual([]);
  });

  it('campo vazio vira erro em português no lugar certo', () => {
    const checks = runCourseChecks({ ...course, modules: [{ ...module, lessons: [{ ...module.lessons[0], summary: ' ' }] }] });
    expect(checks).toContainEqual({
      severity: 'error',
      path: ['modules', 0, 'lessons', 0, 'summary'],
      where: 'M1 · aula 1 · resumo',
      message: 'Preencha este campo.',
    });
  });

  it('mensagem escrita no schema é mantida', () => {
    const checks = runCourseChecks({ ...course, version: '1.0' });
    expect(checks.find((check) => check.where === 'Versão')?.message).toBe('Use versão no formato 1.0.0.');
  });

  it('avisos não bloqueiam, mas aparecem', () => {
    const checks = runCourseChecks({ ...course, description: 'Curta.', guide: undefined, modules: [{ ...module, drills: [], resources: [] }] });
    expect(checks.every((check) => check.severity === 'warning')).toBe(true);
    expect(checks.map((check) => check.where)).toEqual(['Descrição', 'Guia', 'M1', 'M1']);
  });

  it('rascunho recém-aprovado lista o que falta', () => {
    const checks = runCourseChecks({ slug: 'curso', title: 'Curso', modules: [{ id: 'm1', shortTitle: 'Base', title: 'Base' }] });
    expect(checks.some((check) => check.where === 'Descrição' && check.severity === 'error')).toBe(true);
    expect(checks.some((check) => check.where === 'M1 · objetivo')).toBe(true);
  });
});

describe('describeCoursePath', () => {
  it('nomeia módulos, aulas e campos', () => {
    expect(describeCoursePath(['modules', 2, 'project', 'requirements', 0])).toBe('M3 · projeto · requisito 1');
    expect(describeCoursePath(['guide', 'sections', 1, 'items'])).toBe('Guia · seção 2 · itens');
    expect(describeCoursePath(['rhythm', 'weekdayHours'])).toBe('Ritmo da semana · segunda a sexta');
  });
});
