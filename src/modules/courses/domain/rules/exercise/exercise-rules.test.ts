import { describe, expect, it } from 'vitest';
import { EMPTY_EXERCISE_PROGRESS } from '@/modules/progress';
import type { Exercise } from '../../entities/course/module/exercise/exercise.entity';
import { codespacesUrl } from './codespaces-url.rule';
import { isSolutionRevealed } from './is-solution-revealed.rule';
import { labFiles } from './lab-files.rule';
import { missingForCompletion } from './missing-for-completion.rule';
import { scoreQuiz } from './score-quiz.rule';

const quiz: Extract<Exercise, { type: 'quiz' }> = {
  type: 'quiz',
  prompt: 'Responda.',
  passing: 1,
  questions: [
    { id: 'q1', text: 'A?', options: [{ id: 'o1', text: 'sim' }, { id: 'o2', text: 'não' }], correct: 'o1' },
    { id: 'q2', text: 'B?', options: [{ id: 'o1', text: 'sim' }, { id: 'o2', text: 'não' }], correct: 'o2' },
  ],
};

describe('regras de exercício', () => {
  it('quiz conta acertos e o mínimo para passar', () => {
    expect(scoreQuiz(quiz, { q1: 'o1', q2: 'o1' })).toEqual({ correct: 1, total: 2, needed: 1, answered: 2, passed: true });
    expect(scoreQuiz({ ...quiz, passing: undefined }, { q1: 'o1' }).passed).toBe(false);
  });

  it('solução abre conforme a regra do professor', () => {
    const withSolution = { ...quiz, solution: { text: 'Resposta.', reveal: 'after-attempts' as const } };
    expect(isSolutionRevealed(withSolution, { ...EMPTY_EXERCISE_PROGRESS, attempts: 2 })).toBe(false);
    expect(isSolutionRevealed(withSolution, { ...EMPTY_EXERCISE_PROGRESS, attempts: 3 })).toBe(true);
    expect(isSolutionRevealed({ ...withSolution, solution: { text: 'x', reveal: 'never' } }, { ...EMPTY_EXERCISE_PROGRESS, completedAt: 'agora' })).toBe(false);
  });

  it('lista o que falta, sem impedir a conclusão', () => {
    const delivery: Exercise = { type: 'delivery', prompt: 'Entregue.', deliver: 'link-and-text', doneCriteria: ['Funciona', 'Publicado'] };
    expect(missingForCompletion(delivery, { ...EMPTY_EXERCISE_PROGRESS, criteriaDone: [0] }, '')).toEqual([
      '1 critério de pronto sem marcar',
      'o link da entrega',
      'o texto da entrega',
    ]);
    const reflection: Exercise = { type: 'reflection', prompt: 'Pense.', question: 'O que mudou?' };
    expect(missingForCompletion(reflection, EMPTY_EXERCISE_PROGRESS, 'Aprendi.')).toEqual([]);
  });

  it('link do Codespaces e arquivos do laboratório', () => {
    expect(codespacesUrl('https://github.com/ana/lab-busca')).toBe('https://codespaces.new/ana/lab-busca');
    const lab: Extract<Exercise, { type: 'lab' }> = {
      type: 'lab',
      prompt: 'Faça.',
      environment: 'browser',
      runtime: 'python',
      files: [{ name: 'busca.py', content: 'inicial' }],
      checks: [{ id: 'c1', title: 'Roda', test: 'assert True' }],
    };
    expect(labFiles(lab, { ...EMPTY_EXERCISE_PROGRESS, files: { 'busca.py': 'editado' } })).toEqual({ 'busca.py': 'editado' });
  });
});
