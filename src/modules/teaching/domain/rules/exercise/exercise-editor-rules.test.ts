import { describe, expect, it } from 'vitest';
import type { EditableExercise } from '../../entities/draft/editable-exercise.entity';
import { normalizeCourseDraft } from '../draft/normalize-course-draft.rule';
import { changeExerciseType } from './change-exercise-type.rule';
import { createExercise } from './create-exercise.rule';
import { createQuizQuestion } from './create-quiz-question.rule';
import { isRemoteLab } from './is-remote-lab.rule';
import { removeQuizOption } from './remove-quiz-option.rule';

const sequence = () => {
  let next = 0;
  return () => (next++ % 36) / 36;
};

describe('editor de exercícios', () => {
  it('rascunho guarda o exercício com tipo e lê o resto como texto', () => {
    const quiz = createExercise('quiz', sequence());
    const course = normalizeCourseDraft(
      { modules: [{ id: 'm1', lessons: [{ id: 't0', exercise: quiz }, { id: 't1', exercise: { type: 'outro' } }, { id: 't2', exercise: 'Faça.' }] }] },
      '2026-10-28',
    );
    expect(course.modules[0]?.lessons.map((lesson) => lesson.exercise)).toEqual([quiz, '', 'Faça.']);
  });

  it('pergunta nova tem duas opções e a primeira marcada como certa', () => {
    const question = createQuizQuestion([], sequence());
    expect(question.id).toMatch(/^q[a-z0-9]{6}$/);
    expect(question.options).toHaveLength(2);
    expect(question.options[0]?.id).not.toBe(question.options[1]?.id);
    expect(question.correct).toBe(question.options[0]?.id);
  });

  it('remover a opção certa passa a marca para a primeira que sobra', () => {
    const question = { id: 'q1', text: 'A?', options: [{ id: 'o1', text: 'a' }, { id: 'o2', text: 'b' }, { id: 'o3', text: 'c' }], correct: 'o1' };
    expect(removeQuizOption(question, 0)).toMatchObject({ options: [{ id: 'o2' }, { id: 'o3' }], correct: 'o2' });
    expect(removeQuizOption(question, 2).correct).toBe('o1');
  });

  it('trocar o tipo mantém enunciado, dicas e solução', () => {
    const code = { ...createExercise('code', sequence()), prompt: 'Escreva chunk.', hints: ['Use range.'], solution: { text: 'def chunk(): ...', reveal: 'never' as const } };
    const steps = changeExerciseType(code, 'steps', sequence());
    expect(steps).toMatchObject({ type: 'steps', prompt: 'Escreva chunk.', hints: ['Use range.'], solution: { reveal: 'never' } });
    expect(steps).not.toHaveProperty('tests');
    expect(changeExerciseType(code, 'text', sequence())).toBe('Escreva chunk.');
    expect(changeExerciseType('Leia o capítulo.', 'reflection', sequence())).toMatchObject({ type: 'reflection', prompt: 'Leia o capítulo.', question: '' });
    expect(changeExerciseType(code, 'code', sequence())).toBe(code);
  });

  it('só laboratório fora do navegador pede código de conclusão', () => {
    const lab = createExercise('lab', sequence()) as Extract<EditableExercise, { type: 'lab' }>;
    expect(isRemoteLab(lab)).toBe(false);
    expect(isRemoteLab({ ...lab, environment: 'local', repoUrl: 'https://github.com/ana/lab' })).toBe(true);
    expect(isRemoteLab('Faça.')).toBe(false);
  });
});
