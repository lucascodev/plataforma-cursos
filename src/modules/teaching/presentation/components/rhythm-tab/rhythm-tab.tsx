import { TextAreaField } from '@/shared/presentation/components/form/text-area-field/text-area-field';
import { TextField } from '@/shared/presentation/components/form/text-field/text-field';
import type { EditableCourse } from '../../../domain/entities/draft/editable-course.entity';
import { weeklyHours } from '../../../domain/rules/draft/weekly-hours.rule';
import { replaceEntry } from '../../../domain/rules/list/replace-entry.rule';
import styles from '../../styles/editor.module.css';
import type { CourseEditor } from '../../types/course-editor.type';

interface RhythmTabProps {
  readonly course: EditableCourse;
  readonly update: CourseEditor['update'];
}

const readHours = (value: string) => Math.max(0, Number(value) || 0);

export function RhythmTab({ course, update }: RhythmTabProps) {
  const setRhythm = (key: keyof EditableCourse['rhythm'], value: string) =>
    update((current) => ({ ...current, rhythm: { ...current.rhythm, [key]: readHours(value) } }));
  const setKickoff = (key: keyof EditableCourse['kickoff'], value: string) =>
    update((current) => ({ ...current, kickoff: { ...current.kickoff, [key]: value } }));
  const setMonths = (index: number, value: string) =>
    update((current) => {
      const module = current.modules[index];
      return module ? { ...current, modules: replaceEntry(current.modules, index, { ...module, months: readHours(value) }) } : current;
    });

  return (
    <div className={styles.fields}>
      <section className={styles.card} aria-labelledby="ritmo-semana">
        <h2 id="ritmo-semana" className={styles.cardTitle}>
          Ritmo da semana
        </h2>
        <div className={styles.columns}>
          <TextField label="Segunda a sexta (h por dia)" type="number" min={0} max={8} step={0.5} value={course.rhythm.weekdayHours} onChange={(event) => setRhythm('weekdayHours', event.target.value)} />
          <TextField label="Sábado (h)" type="number" min={0} max={12} step={0.5} value={course.rhythm.saturdayHours} onChange={(event) => setRhythm('saturdayHours', event.target.value)} />
          <TextField label="Domingo (h)" type="number" min={0} max={12} step={0.5} value={course.rhythm.sundayHours} onChange={(event) => setRhythm('sundayHours', event.target.value)} />
        </div>
        <p className={styles.muted}>{weeklyHours(course.rhythm).toLocaleString('pt-BR')} h por semana.</p>
      </section>

      <section className={styles.card} aria-labelledby="ritmo-duracao">
        <h2 id="ritmo-duracao" className={styles.cardTitle}>
          Duração de cada módulo
        </h2>
        <p className={styles.cardHint}>A plataforma divide os meses em aulas, exercícios de fixação, projeto e autoavaliação. Módulos contínuos usam só os domingos e ficam com 0.</p>
        {course.modules.length === 0 ? <p className={styles.muted}>Adicione módulos na aba Módulos e aulas.</p> : null}
        <div className={styles.columns}>
          {course.modules.map((module, index) => (
            <TextField
              key={module.id}
              label={`M${index + 1} · ${module.shortTitle || module.title || module.id} (meses)`}
              type="number"
              min={0}
              max={24}
              step={0.5}
              value={module.months}
              onChange={(event) => setMonths(index, event.target.value)}
            />
          ))}
        </div>
      </section>

      <section className={styles.card} aria-labelledby="ritmo-inicio">
        <h2 id="ritmo-inicio" className={styles.cardTitle}>
          Primeiro dia
        </h2>
        <TextField label="Tarefa" value={course.kickoff.title} maxLength={160} onChange={(event) => setKickoff('title', event.target.value)} />
        <TextAreaField label="O que fazer" rows={3} value={course.kickoff.detail} maxLength={800} onChange={(event) => setKickoff('detail', event.target.value)} />
      </section>

      <p className={styles.muted}>
        {course.sundayTrack
          ? 'A trilha de domingo deste curso é mantida como está. O editor dela chega numa próxima versão da plataforma.'
          : 'Este curso não tem trilha de domingo.'}{' '}
        Quem já começou recebe o plano novo quando a versão for publicada; dias marcados como feitos continuam feitos.
      </p>
    </div>
  );
}
