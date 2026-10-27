import { StatTile } from '@/shared/presentation/components/data/stat-tile/stat-tile';
import { Skeleton } from '@/shared/presentation/components/feedback/skeleton/skeleton';
import { describeSmallCount } from '../../formatters/describe-small-count';
import { useCourseStatsQuery } from '../../hooks/use-course-stats-query/use-course-stats-query';
import styles from './course-stats-panel.module.css';

const PERCENT = 100;

export function CourseStatsPanel({ slug }: { readonly slug: string }) {
  const stats = useCourseStatsQuery(slug);
  if (stats.isPending) return <Skeleton height="120px" radius="md" />;
  if (stats.isError) return <p className={styles.note}>Não foi possível carregar os números agora.</p>;
  const { students, active7d, projectsDelivered, completed, modules } = stats.data;
  const widest = Math.max(...modules.map((module) => module.people ?? 0), 1);

  return (
    <div className={styles.panel}>
      <dl className={styles.tiles}>
        <StatTile label="Pessoas estudando" value={describeSmallCount(students)} />
        <StatTile label="Ativas nos últimos 7 dias" value={describeSmallCount(active7d)} />
        <StatTile label="Projetos entregues" value={describeSmallCount(projectsDelivered)} />
        <StatTile label="Concluíram o curso" value={describeSmallCount(completed)} />
      </dl>
      <div className={styles.modules}>
        <h3 className={styles.heading}>Onde as pessoas estão</h3>
        {modules.length === 0 ? (
          <p className={styles.note}>Aparece quando o curso tiver pelo menos 5 pessoas estudando.</p>
        ) : (
          <ul className={styles.bars}>
            {modules.map((module, index) => (
              <li key={module.moduleId} className={styles.bar}>
                <span className={styles.code} title={module.shortTitle}>
                  M{index + 1}
                </span>
                <span className={styles.track} aria-hidden="true">
                  <span className={styles.fill} style={{ width: `${((module.people ?? 0) / widest) * PERCENT}%` }} />
                </span>
                <span className={styles.count}>{describeSmallCount(module.people)}</span>
              </li>
            ))}
          </ul>
        )}
        <p className={styles.note}>Números somados. Nomes, anotações e diário de quem estuda nunca aparecem para professores.</p>
      </div>
    </div>
  );
}
