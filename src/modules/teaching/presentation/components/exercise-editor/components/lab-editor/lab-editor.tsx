import { Play } from 'lucide-react';
import { Button } from '@/shared/presentation/components/actions/button/button';
import { SelectField } from '@/shared/presentation/components/form/select-field/select-field';
import { TextField } from '@/shared/presentation/components/form/text-field/text-field';
import type { EditableExercise } from '../../../../../domain/entities/draft/editable-exercise.entity';
import { LAB_ENVIRONMENT_OPTIONS } from '../../../../constants/exercise/lab-environment-options';
import { LAB_RUNTIME_OPTIONS } from '../../../../constants/exercise/lab-runtime-options';
import { useReferenceRun } from '../../../../hooks/use-reference-run/use-reference-run';
import styles from '../../../../styles/editor.module.css';
import { TextListEditor } from '../../../text-list-editor/text-list-editor';
import { ReferenceRunResult } from '../reference-run-result/reference-run-result';
import { LabChecksEditor } from './components/lab-checks-editor/lab-checks-editor';
import { LabCodeField } from './components/lab-code-field/lab-code-field';
import { LabFilesEditor } from './components/lab-files-editor/lab-files-editor';

type Lab = Extract<EditableExercise, { type: 'lab' }>;

interface LabEditorProps {
  readonly lab: Lab;
  readonly courseSlug: string;
  readonly itemKey: string;
  readonly onChange: (lab: Lab) => void;
}

export function LabEditor({ lab, courseSlug, itemKey, onChange }: LabEditorProps) {
  const reference = useReferenceRun();
  const isBrowser = lab.environment === 'browser';
  const files = lab.files ?? [];
  const runStartingFiles = () =>
    reference.run({
      language: lab.runtime ?? 'python',
      mode: 'checks',
      files: Object.fromEntries(files.map((file) => [file.name, file.content])),
      checks: lab.checks.map((check) => ({ id: check.id, test: check.test ?? '' })),
    });

  return (
    <div className={styles.fields}>
      <div className={styles.columns}>
        <SelectField
          label="Onde a pessoa faz"
          value={lab.environment}
          options={LAB_ENVIRONMENT_OPTIONS}
          onChange={(event) => onChange({ ...lab, environment: event.target.value as Lab['environment'] })}
        />
        {isBrowser ? (
          <SelectField
            label="Linguagem"
            value={lab.runtime ?? 'python'}
            options={LAB_RUNTIME_OPTIONS}
            onChange={(event) => onChange({ ...lab, runtime: event.target.value as NonNullable<Lab['runtime']> })}
          />
        ) : null}
      </div>
      {isBrowser ? (
        <>
          <LabFilesEditor files={files} onChange={(next) => onChange({ ...lab, files: next })} />
          <LabChecksEditor checks={lab.checks} hasTests onChange={(checks) => onChange({ ...lab, checks })} />
          <div className={styles.actions}>
            <Button isLoading={reference.isRunning} onClick={() => void runStartingFiles()}>
              <Play size={16} aria-hidden="true" />
              Rodar as etapas com os arquivos iniciais
            </Button>
          </div>
          {reference.result ? (
            <ReferenceRunResult result={reference.result} titles={Object.fromEntries(lab.checks.map((check) => [check.id, check.title || check.id]))} />
          ) : null}
        </>
      ) : (
        <>
          <TextField
            label="Repositório do laboratório"
            type="url"
            placeholder="https://github.com/usuario/repositorio"
            value={lab.repoUrl ?? ''}
            hint={lab.environment === 'codespaces' ? 'Precisa ter um .devcontainer, para o Codespaces montar o ambiente.' : 'A pessoa clona e roda no próprio computador.'}
            onChange={(event) => onChange({ ...lab, repoUrl: event.target.value.trim() || undefined })}
          />
          <TextListEditor
            title="Comandos depois de abrir o laboratório"
            itemLabel="Comando"
            addLabel="Adicionar comando"
            items={lab.setup ?? []}
            maxLength={400}
            onChange={(setup) => onChange({ ...lab, setup: setup.length > 0 ? setup : undefined })}
          />
          <LabChecksEditor checks={lab.checks} hasTests={false} onChange={(checks) => onChange({ ...lab, checks })} />
          <LabCodeField courseSlug={courseSlug} itemKey={itemKey} />
        </>
      )}
    </div>
  );
}
