import { httpsUrlSchema } from '@contracts/url/https-url.schema';
import { useState } from 'react';
import type { CourseProgressState, ExerciseProgress } from '@/modules/progress';
import { EMPTY_EXERCISE_PROGRESS } from '@/modules/progress';
import type { CodeJob } from '@/shared/application/ports/code-runner/code-job.type';
import type { CodeRunResult } from '@/shared/application/ports/code-runner/code-run-result.type';
import { makeCodeRunner } from '@/shared/main/factories/make-code-runner.factory';
import { readErrorMessage } from '@/shared/presentation/formatters/read-error-message';
import { useToast } from '@/shared/presentation/hooks/use-toast/use-toast';
import type { Exercise } from '../../../domain/entities/course/module/exercise/exercise.entity';
import { codeFileName } from '../../../domain/rules/exercise/code-file-name.rule';
import { isSolutionRevealed } from '../../../domain/rules/exercise/is-solution-revealed.rule';
import { labFiles } from '../../../domain/rules/exercise/lab-files.rule';
import { missingForCompletion } from '../../../domain/rules/exercise/missing-for-completion.rule';
import { scoreQuiz } from '../../../domain/rules/exercise/score-quiz.rule';
import { makeVerifyLabCode } from '../../../main/factories/make-verify-lab-code.factory';
import type { ExerciseView } from '../../types/exercise/exercise-view.type';

const MAX_PASSED = 30;

const toggle = <T,>(list: readonly T[], value: T): T[] => (list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
const allPassed = (result: CodeRunResult) => result.error === null && result.results.length > 0 && result.results.every((item) => item.passed);

interface UseExerciseInput {
  readonly courseSlug: string;
  readonly itemKey: string;
  readonly exercise: Exercise;
  readonly progressState: CourseProgressState;
  readonly journalText: string;
  readonly setJournalText: (value: string) => void;
}

function buildJob(exercise: Exercise, code: string, files: Record<string, string>): CodeJob | null {
  if (exercise.type === 'code') {
    return { language: exercise.language, mode: 'tests', files: { [codeFileName(exercise.language)]: code }, tests: exercise.tests };
  }
  if (exercise.type === 'lab' && exercise.environment === 'browser' && exercise.runtime) {
    return { language: exercise.runtime, mode: 'checks', files, checks: exercise.checks.map((check) => ({ id: check.id, test: check.test ?? '' })) };
  }
  return null;
}

// Everything an exercise needs: the person's state (saved with the progress), running code in the sandboxed runner and
// checking a lab code with the API.
export function useExercise({ courseSlug, itemKey, exercise, progressState, journalText, setJournalText }: UseExerciseInput): ExerciseView {
  const toast = useToast();
  const state = progressState.progress?.exercises[itemKey] ?? EMPTY_EXERCISE_PROGRESS;
  const [lastRun, setLastRun] = useState<CodeRunResult | null>(null);
  const [isRunning, setRunning] = useState(false);
  const [labCode, setLabCode] = useState('');
  const [labError, setLabError] = useState<string | null>(null);
  const [isVerifying, setVerifying] = useState(false);
  const [deliveryUrlDraft, setDeliveryUrlDraft] = useState(state.deliveryUrl ?? '');
  const [isConfirmingFinish, setConfirmingFinish] = useState(false);

  const change = (update: (current: ExerciseProgress) => ExerciseProgress) => progressState.actions.updateExercise(itemKey, update);
  const code = state.code ?? (exercise.type === 'code' ? exercise.starter : '');
  const files = exercise.type === 'lab' ? labFiles(exercise, state) : {};
  const missing = missingForCompletion(exercise, state, journalText);
  const urlCheck = httpsUrlSchema.safeParse(deliveryUrlDraft.trim());
  const complete = () => {
    setConfirmingFinish(false);
    progressState.actions.completeExercise(itemKey, true);
    toast.show({ text: 'Exercício concluído.', tone: 'success', action: { label: 'Desfazer', onAction: () => progressState.actions.completeExercise(itemKey, false) } });
  };

  return {
    exercise,
    state,
    missing,
    isDone: state.completedAt !== null,
    isSolutionRevealed: isSolutionRevealed(exercise, state),
    quizScore: exercise.type === 'quiz' ? scoreQuiz(exercise, state.answers) : null,
    code,
    files,
    lastRun,
    isRunning,
    labCode,
    labError,
    isVerifying,
    deliveryUrlDraft,
    deliveryUrlError: deliveryUrlDraft.trim() && !urlCheck.success ? 'Use um link completo, começando com https://' : null,
    journalText,
    isConfirmingFinish,
    toggleStep: (stepId) => change((current) => ({ ...current, stepsDone: toggle(current.stepsDone, stepId) })),
    toggleCriterion: (index) => change((current) => ({ ...current, criteriaDone: toggle(current.criteriaDone, index) })),
    answer: (questionId, optionId) => change((current) => ({ ...current, answers: { ...current.answers, [questionId]: optionId } })),
    checkQuiz: () => change((current) => ({ ...current, attempts: current.attempts + 1 })),
    setDeliveryUrl: (value) => {
      setDeliveryUrlDraft(value);
      const parsed = httpsUrlSchema.safeParse(value.trim());
      change((current) => ({ ...current, deliveryUrl: parsed.success ? parsed.data : null }));
    },
    setDeliveryText: (value) => change((current) => ({ ...current, deliveryText: value })),
    setJournalText,
    setCode: (value) => change((current) => ({ ...current, code: value })),
    setFile: (name, content) => change((current) => ({ ...current, files: { ...current.files, [name]: content } })),
    run: async () => {
      const job = buildJob(exercise, code, files);
      if (!job || isRunning) return;
      setRunning(true);
      const result = await makeCodeRunner().run(job);
      setRunning(false);
      setLastRun(result);
      const passedIds = result.error === null ? result.results.filter((item) => item.passed).map((item) => item.id) : [];
      change((current) => ({
        ...current,
        attempts: current.attempts + 1,
        passedChecks: exercise.type === 'code' && !allPassed(result) ? [] : passedIds.slice(0, MAX_PASSED),
      }));
    },
    setLabCode: (value) => {
      setLabCode(value);
      setLabError(null);
    },
    verifyLabCode: async () => {
      if (exercise.type !== 'lab' || isVerifying) return;
      setVerifying(true);
      try {
        const completed = await makeVerifyLabCode().execute(courseSlug, itemKey, labCode);
        change((current) => ({
          ...current,
          attempts: current.attempts + 1,
          passedChecks: completed ? exercise.checks.map((check) => check.id) : current.passedChecks,
        }));
        setLabError(completed ? null : 'Esse código não confere. Rode a verificação de novo e copie o código inteiro.');
        if (completed) toast.show({ text: 'Laboratório conferido: todas as etapas passaram.', tone: 'success' });
      } catch (error) {
        setLabError(readErrorMessage(error, 'Não foi possível conferir o código agora.'));
      } finally {
        setVerifying(false);
      }
    },
    openHint: () => change((current) => ({ ...current, hintsOpened: Math.min(current.hintsOpened + 1, exercise.hints?.length ?? 0) })),
    finish: () => (missing.length > 0 ? setConfirmingFinish(true) : complete()),
    confirmFinish: complete,
    cancelFinish: () => setConfirmingFinish(false),
    undo: () => progressState.actions.completeExercise(itemKey, false),
  };
}
