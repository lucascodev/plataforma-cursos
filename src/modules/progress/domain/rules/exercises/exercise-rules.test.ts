import { describe, expect, it } from 'vitest';
import { createEmptyProgress } from '../create-empty-progress.rule';
import { mergeProgress } from '../merge/merge-progress.rule';
import { completeExercise } from './complete-exercise.rule';
import { updateExercise } from './update-exercise.rule';

const NOW = '2027-01-11T12:00:00.000Z';

describe('exercícios no progresso', () => {
  it('atualizar cria o estado do exercício a partir do vazio', () => {
    const progress = updateExercise(createEmptyProgress(), 'm1-t0', (exercise) => ({ ...exercise, stepsDone: ['p1'] }));
    expect(progress.exercises['m1-t0']?.stepsDone).toEqual(['p1']);
    expect(progress.exercises['m1-t0']?.attempts).toBe(0);
  });

  it('mudança que não muda nada devolve o mesmo progresso', () => {
    const progress = createEmptyProgress();
    expect(updateExercise(progress, 'm1-t0', (exercise) => exercise)).toBe(progress);
  });

  it('concluir marca a aula como feita, e desfazer desmarca', () => {
    const done = completeExercise(createEmptyProgress(), 'm1-t0', true, NOW);
    expect(done.completedItems['m1-t0']).toBe(true);
    expect(done.exercises['m1-t0']?.completedAt).toBe(NOW);
    const undone = completeExercise(done, 'm1-t0', false, NOW);
    expect(undone.completedItems['m1-t0']).toBeUndefined();
    expect(undone.exercises['m1-t0']?.completedAt).toBeNull();
  });

  it('duas abas mexendo em exercícios diferentes não perdem nada', () => {
    const base = createEmptyProgress();
    const local = updateExercise(base, 'm1-t0', (exercise) => ({ ...exercise, attempts: 2 }));
    const remote = updateExercise(base, 'm1-t1', (exercise) => ({ ...exercise, attempts: 1 }));
    const merged = mergeProgress(base, local, remote);
    expect(Object.keys(merged.exercises).sort()).toEqual(['m1-t0', 'm1-t1']);
  });
});
