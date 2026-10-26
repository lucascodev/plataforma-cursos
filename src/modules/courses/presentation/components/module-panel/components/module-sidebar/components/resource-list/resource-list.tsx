import { ExternalLink } from '@/shared/presentation/components/navigation/external-link/external-link';
import type { Resource } from '../../../../../../../domain/entities/course/resource.entity';
import styles from './resource-list.module.css';

interface ResourceListProps {
  resources: readonly Resource[];
}

export function ResourceList({ resources }: ResourceListProps) {
  return (
    <div>
      <h4 className={styles.title}>Materiais</h4>
      <ul className={styles.list}>
        {resources.map((resource) => (
          <li key={resource.url} className={styles.item}>
            <span className={styles.type}>{resource.type}</span>
            <ExternalLink href={resource.url}>{resource.label}</ExternalLink>
          </li>
        ))}
      </ul>
    </div>
  );
}
