import { describe, expect, it } from 'vitest';
import { createEmptyProgress } from '../create-empty-progress.rule';
import { deliverProject } from './deliver-project.rule';
import { setProjectCheck } from './set-project-check.rule';

describe('regras do projeto', () => {
  it('marca e desmarca requisitos e critérios por módulo', () => {
    const checked = setProjectCheck(createEmptyProgress(), 'm1', 'requirements', 'r0', true);
    expect(checked.projectChecks.m1?.requirements).toEqual({ r0: true });
    expect(checked.projectChecks.m1?.criteria).toEqual({});
    expect(setProjectCheck(checked, 'm1', 'requirements', 'r0', false).projectChecks.m1?.requirements).toEqual({});
  });

  it('não cria objeto novo quando nada muda', () => {
    const progress = createEmptyProgress();
    expect(setProjectCheck(progress, 'm1', 'criteria', 'c0', false)).toBe(progress);
  });

  it('entregar guarda a entrega e conclui o item do projeto', () => {
    const delivered = deliverProject(createEmptyProgress(), 'm1', 'm1-cp', {
      repoUrl: 'https://github.com/ana/mini-gpt',
      demoUrl: null,
      metrics: '',
      deliveredAt: '2026-10-26T12:00:00.000Z',
    });
    expect(delivered.projectDeliveries.m1?.repoUrl).toBe('https://github.com/ana/mini-gpt');
    expect(delivered.completedItems['m1-cp']).toBe(true);
  });
});
