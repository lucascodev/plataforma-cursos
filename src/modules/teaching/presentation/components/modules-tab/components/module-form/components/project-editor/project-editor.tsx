import { TextAreaField } from '@/shared/presentation/components/form/text-area-field/text-area-field';
import { TextField } from '@/shared/presentation/components/form/text-field/text-field';
import type { EditableProject } from '../../../../../../../domain/entities/draft/editable-module.entity';
import styles from '../../../../../../styles/editor.module.css';
import { TextListEditor } from '../../../../../text-list-editor/text-list-editor';

interface ProjectEditorProps {
  readonly project: EditableProject;
  readonly onChange: (project: EditableProject) => void;
}

export function ProjectEditor({ project, onChange }: ProjectEditorProps) {
  return (
    <section className={styles.card} aria-labelledby="modulo-projeto">
      <h3 id="modulo-projeto" className={styles.cardTitle}>
        Projeto do módulo
      </h3>
      <TextField label="Título" value={project.title} maxLength={160} onChange={(event) => onChange({ ...project, title: event.target.value })} />
      <TextAreaField label="Enunciado" rows={4} value={project.brief} maxLength={800} onChange={(event) => onChange({ ...project, brief: event.target.value })} />
      <TextListEditor
        title="Requisitos"
        itemLabel="Requisito"
        addLabel="Adicionar requisito"
        items={project.requirements}
        maxLength={400}
        onChange={(requirements) => onChange({ ...project, requirements })}
      />
      <TextListEditor
        title="Pronto quando"
        itemLabel="Critério"
        addLabel="Adicionar critério"
        items={project.doneCriteria}
        maxLength={400}
        onChange={(doneCriteria) => onChange({ ...project, doneCriteria })}
      />
    </section>
  );
}
