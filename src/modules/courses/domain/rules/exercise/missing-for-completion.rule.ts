import type { ExerciseProgress } from '@/modules/progress';
import type { Exercise } from '../../entities/course/module/exercise/exercise.entity';
import { scoreQuiz } from './score-quiz.rule';

// What is still open. Finishing is never blocked (the person may come back later), but the page says what is missing.
export function missingForCompletion(exercise: Exercise, state: ExerciseProgress, journalText: string): string[] {
  const missing: string[] = [];
  const criteria = exercise.doneCriteria ?? [];
  const openCriteria = criteria.length - state.criteriaDone.filter((index) => index < criteria.length).length;
  if (openCriteria > 0) missing.push(openCriteria === 1 ? '1 critério de pronto sem marcar' : `${openCriteria} critérios de pronto sem marcar`);
  switch (exercise.type) {
    case 'delivery':
      if (exercise.deliver !== 'text' && !state.deliveryUrl) missing.push('o link da entrega');
      if (exercise.deliver !== 'link' && !state.deliveryText.trim()) missing.push('o texto da entrega');
      break;
    case 'quiz': {
      const score = scoreQuiz(exercise, state.answers);
      if (!score.passed) missing.push(`acertar pelo menos ${score.needed} de ${score.total} perguntas`);
      break;
    }
    case 'steps': {
      const open = exercise.steps.filter((step) => !state.stepsDone.includes(step.id)).length;
      if (open > 0) missing.push(open === 1 ? '1 passo' : `${open} passos`);
      break;
    }
    case 'reflection':
      if (!journalText.trim()) missing.push('a resposta no diário');
      break;
    case 'code':
      if (state.passedChecks.length === 0) missing.push('passar nos testes');
      break;
    case 'lab': {
      const open = exercise.checks.filter((check) => !state.passedChecks.includes(check.id)).length;
      if (open > 0) missing.push(open === 1 ? '1 etapa do laboratório' : `${open} etapas do laboratório`);
      break;
    }
  }
  return missing;
}
