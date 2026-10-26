import type { StudySummary } from '../../../domain/entities/studies/study-summary.entity';
import { StatCard } from '../stat-card/stat-card';
import styles from './study-stats.module.css';

const label = (count: number, singular: string, plural: string) => (count === 1 ? singular : plural);

export function StudyStats({ summary }: { summary: StudySummary }) {
  return (
    <div className={styles.grid}>
      <StatCard value={String(summary.studyDays)} label={label(summary.studyDays, 'dia de estudo', 'dias de estudo')} />
      <StatCard value={String(summary.completedItems)} label={label(summary.completedItems, 'item concluído', 'itens concluídos')} />
      <StatCard value={String(summary.projectsDone)} label={label(summary.projectsDone, 'projeto entregue', 'projetos entregues')} />
      <StatCard value={String(summary.coursesStarted)} label={label(summary.coursesStarted, 'curso em andamento', 'cursos em andamento')} />
    </div>
  );
}
