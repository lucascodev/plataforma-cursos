import { Trash2 } from 'lucide-react';
import { Button } from '@/shared/presentation/components/actions/button/button';
import { SelectField } from '@/shared/presentation/components/form/select-field/select-field';
import { TextAreaField } from '@/shared/presentation/components/form/text-area-field/text-area-field';
import { TextField } from '@/shared/presentation/components/form/text-field/text-field';
import type { EditableModule } from '../../../../../domain/entities/draft/editable-module.entity';
import styles from '../../../../styles/editor.module.css';
import { TextListEditor } from '../../../text-list-editor/text-list-editor';
import { DrillListEditor } from './components/drill-list-editor/drill-list-editor';
import { LessonListEditor } from './components/lesson-list-editor/lesson-list-editor';
import { ProjectEditor } from './components/project-editor/project-editor';
import { ResourceListEditor } from './components/resource-list-editor/resource-list-editor';

const KIND_OPTIONS = [
  { value: 'standard', label: 'Módulo normal' },
  { value: 'capstone', label: 'Projeto de conclusão' },
  { value: 'continuous', label: 'Contínuo (só domingos)' },
];

interface ModuleFormProps {
  readonly courseSlug: string;
  readonly module: EditableModule;
  readonly code: string;
  readonly onChange: (module: EditableModule) => void;
  readonly onAddLesson: () => void;
  readonly onRemoveLesson: (index: number) => void;
  readonly onAddDrill: () => void;
  readonly onRemoveDrill: (index: number) => void;
  readonly onRemoveModule: () => void;
}

export function ModuleForm({ courseSlug, module, code, onChange, onAddLesson, onRemoveLesson, onAddDrill, onRemoveDrill, onRemoveModule }: ModuleFormProps) {
  const set = <K extends keyof EditableModule>(key: K, value: EditableModule[K]) => onChange({ ...module, [key]: value });
  const setKind = (kind: EditableModule['kind']) => onChange({ ...module, kind, months: kind === 'continuous' ? 0 : module.months || 1 });

  return (
    <div className={styles.fields}>
      <section className={styles.card} aria-labelledby="modulo-dados">
        <div className={styles.itemHeader}>
          <h2 id="modulo-dados" className={styles.cardTitle}>
            {code} · {module.title || 'Módulo sem nome'} <span className={styles.itemId}>id {module.id}</span>
          </h2>
          <Button tone="danger" onClick={onRemoveModule}>
            <Trash2 size={16} aria-hidden="true" />
            Remover módulo
          </Button>
        </div>
        <TextField label="Título" value={module.title} maxLength={160} onChange={(event) => set('title', event.target.value)} />
        <div className={styles.columns}>
          <TextField label="Nome curto" value={module.shortTitle} maxLength={40} hint="Aparece no menu e no plano." onChange={(event) => set('shortTitle', event.target.value)} />
          <SelectField label="Tipo" value={module.kind} options={KIND_OPTIONS} onChange={(event) => setKind(event.target.value as EditableModule['kind'])} />
        </div>
        <TextAreaField label="Objetivo" rows={2} value={module.goal} maxLength={600} onChange={(event) => set('goal', event.target.value)} />
        <TextAreaField label="Pré-requisito" rows={2} value={module.prerequisite} maxLength={400} onChange={(event) => set('prerequisite', event.target.value)} />
        <TextAreaField label="Caso de estudo" rows={2} value={module.caseStudy} maxLength={600} onChange={(event) => set('caseStudy', event.target.value)} />
        <TextAreaField
          label="Dica para computador modesto (opcional)"
          rows={2}
          value={module.lowSpecTip ?? ''}
          maxLength={800}
          onChange={(event) => set('lowSpecTip', event.target.value || undefined)}
        />
      </section>
      <LessonListEditor courseSlug={courseSlug} moduleId={module.id} lessons={module.lessons} onChange={(lessons) => set('lessons', lessons)} onAdd={onAddLesson} onRemove={onRemoveLesson} />
      <DrillListEditor drills={module.drills} onChange={(drills) => set('drills', drills)} onAdd={onAddDrill} onRemove={onRemoveDrill} />
      <ProjectEditor project={module.project} onChange={(project) => set('project', project)} />
      <section className={styles.card} aria-labelledby="modulo-autoavaliacao">
        <h3 id="modulo-autoavaliacao" className={styles.cardTitle}>
          Autoavaliação
        </h3>
        <TextListEditor
          title="Perguntas para a pessoa responder ao fim do módulo"
          itemLabel="Pergunta"
          addLabel="Adicionar pergunta"
          items={module.selfCheck}
          maxLength={300}
          onChange={(selfCheck) => set('selfCheck', selfCheck)}
        />
      </section>
      <ResourceListEditor resources={module.resources} onChange={(resources) => set('resources', resources)} />
    </div>
  );
}
