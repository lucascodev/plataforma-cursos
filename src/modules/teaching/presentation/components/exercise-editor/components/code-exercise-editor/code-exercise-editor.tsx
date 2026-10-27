import { codeFileName } from '@contracts/course/exercise/code-file-name';
import { Play } from 'lucide-react';
import { Button } from '@/shared/presentation/components/actions/button/button';
import { SelectField } from '@/shared/presentation/components/form/select-field/select-field';
import { TextAreaField } from '@/shared/presentation/components/form/text-area-field/text-area-field';
import type { EditableExercise } from '../../../../../domain/entities/draft/editable-exercise.entity';
import { CODE_LANGUAGE_OPTIONS } from '../../../../constants/exercise/code-language-options';
import { useReferenceRun } from '../../../../hooks/use-reference-run/use-reference-run';
import styles from '../../../../styles/editor.module.css';
import { ReferenceRunResult } from '../reference-run-result/reference-run-result';

type Code = Extract<EditableExercise, { type: 'code' }>;

const TEST_HINTS: Readonly<Record<Code['language'], string>> = {
  python: 'Funções que começam com test_ e usam assert. Importe o código da pessoa de solucao, como "from solucao import chunk".',
  javascript: 'Chame test("nome", () => { ... }) com assert(condição, mensagem) ou assertEqual(atual, esperado). O código da pessoa já vem carregado.',
  sql: 'Separe os testes com uma linha "-- test: nome". Cada teste é uma consulta que devolve 1 quando está certo.',
};

export function CodeExerciseEditor({ exercise, onChange }: { readonly exercise: Code; readonly onChange: (exercise: Code) => void }) {
  const reference = useReferenceRun();
  const solution = exercise.solution?.text ?? '';
  const runWithSolution = () =>
    reference.run({ language: exercise.language, mode: 'tests', files: { [codeFileName(exercise.language)]: solution }, tests: exercise.tests });

  return (
    <div className={styles.fields}>
      <SelectField
        label="Linguagem"
        value={exercise.language}
        options={CODE_LANGUAGE_OPTIONS}
        onChange={(event) => onChange({ ...exercise, language: event.target.value as Code['language'] })}
      />
      <TextAreaField
        label="Código inicial"
        rows={6}
        isCode
        value={exercise.starter}
        maxLength={20_000}
        hint={`O que a pessoa encontra no editor. É salvo como ${codeFileName(exercise.language)}.`}
        onChange={(event) => onChange({ ...exercise, starter: event.target.value })}
      />
      <TextAreaField
        label="Testes"
        rows={10}
        isCode
        value={exercise.tests}
        maxLength={20_000}
        hint={TEST_HINTS[exercise.language]}
        onChange={(event) => onChange({ ...exercise, tests: event.target.value })}
      />
      <p className={styles.muted}>
        Os testes vão junto com o curso e rodam no navegador da pessoa. Passar neles é uma conferência de boa-fé, não uma prova.
      </p>
      <div className={styles.actions}>
        <Button isLoading={reference.isRunning} disabled={!solution.trim() || !exercise.tests.trim()} onClick={() => void runWithSolution()}>
          <Play size={16} aria-hidden="true" />
          Rodar os testes com a solução
        </Button>
        {!solution.trim() ? <span className={styles.muted}>Escreva a solução de referência abaixo para conferir os testes.</span> : null}
      </div>
      {reference.result ? <ReferenceRunResult result={reference.result} /> : null}
    </div>
  );
}
