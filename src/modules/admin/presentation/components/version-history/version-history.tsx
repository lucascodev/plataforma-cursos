import { Link } from 'react-router';
import { describeVersionStatus } from '../../formatters/describe-version-status';
import { formatDateTime } from '../../formatters/format-date-time';
import { useCourseVersionsQuery } from '../../hooks/use-course-versions-query/use-course-versions-query';
import styles from './version-history.module.css';

interface VersionHistoryProps {
  readonly slug: string;
  readonly currentId: string;
}

export function VersionHistory({ slug, currentId }: VersionHistoryProps) {
  const versions = useCourseVersionsQuery(slug);
  if (!versions.data || versions.data.length <= 1) return null;

  return (
    <section className={styles.card} aria-labelledby="historico-versoes">
      <h2 id="historico-versoes" className={styles.heading}>
        Versões deste curso
      </h2>
      <ul className={styles.list}>
        {versions.data.map((version) => {
          const label = `${version.semver ? `v${version.semver}` : 'Rascunho'} · ${describeVersionStatus(version.status)} · ${formatDateTime(version.publishedAt ?? version.updatedAt)}`;
          return <li key={version.id}>{version.id === currentId ? <strong>{label}</strong> : <Link to={`/admin/versoes/${version.id}`}>{label}</Link>}</li>;
        })}
      </ul>
    </section>
  );
}
