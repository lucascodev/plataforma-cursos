import { SelectField } from '@/shared/presentation/components/form/select-field/select-field';
import { TextAreaField } from '@/shared/presentation/components/form/text-area-field/text-area-field';
import { TextField } from '@/shared/presentation/components/form/text-field/text-field';
import type { EditableCourse } from '../../../domain/entities/draft/editable-course.entity';
import styles from '../../styles/editor.module.css';
import type { CourseEditor } from '../../types/course-editor.type';

const LEVELS = ['Iniciante', 'Intermediário', 'Avançado'];

interface InfoTabProps {
  readonly course: EditableCourse;
  readonly update: CourseEditor['update'];
}

export function InfoTab({ course, update }: InfoTabProps) {
  const set = <K extends keyof EditableCourse>(key: K, value: EditableCourse[K]) => update((current) => ({ ...current, [key]: value }));
  const levelOptions = [...new Set([...LEVELS, course.level].filter(Boolean))].map((level) => ({ value: level, label: level }));

  return (
    <div className={styles.fields}>
      <section className={styles.card} aria-labelledby="info-curso">
        <h2 id="info-curso" className={styles.cardTitle}>
          Informações do curso
        </h2>
        <TextField label="Título" value={course.title} maxLength={120} onChange={(event) => set('title', event.target.value)} />
        <TextField
          label="Endereço"
          value={`/cursos/${course.slug}`}
          readOnly
          hint="O endereço fica fixo, para não quebrar links nem o progresso de quem estuda."
        />
        <TextField
          label="Frase curta"
          value={course.tagline}
          maxLength={240}
          hint="Aparece no catálogo, abaixo do título."
          onChange={(event) => set('tagline', event.target.value)}
        />
        <TextAreaField
          label="Descrição"
          rows={5}
          value={course.description}
          maxLength={2000}
          onChange={(event) => set('description', event.target.value)}
        />
        <div className={styles.columns}>
          <SelectField
            label="Nível"
            value={course.level || ''}
            options={[{ value: '', label: 'Escolha o nível' }, ...levelOptions]}
            onChange={(event) => set('level', event.target.value)}
          />
          <TextField label="Para quem é" value={course.audience} maxLength={200} onChange={(event) => set('audience', event.target.value)} />
        </div>
      </section>
      <p className={styles.muted}>O conteúdo é publicado sob a licença CC BY 4.0, como combinado na proposta. Material de terceiros entra como link.</p>
    </div>
  );
}
