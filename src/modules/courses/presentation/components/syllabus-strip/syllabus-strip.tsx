import type { ModuleView } from '../../types/module/module-view.type';
import styles from './syllabus-strip.module.css';

interface SyllabusStripProps {
  modules: readonly ModuleView[];
  onSelect: (moduleId: string) => void;
}

export function SyllabusStrip({ modules, onSelect }: SyllabusStripProps) {
  return (
    <ol className={styles.strip}>
      {modules.map((module) => (
        <li key={module.id}>
          <button
            type="button"
            className={[styles.chip, module.isCurrent ? styles.current : '', module.isComplete ? styles.complete : ''].filter(Boolean).join(' ')}
            onClick={() => onSelect(module.id)}
            aria-current={module.isCurrent ? 'step' : undefined}
          >
            <span className={styles.number}>M{module.number}</span>
            <span className={styles.name}>{module.shortTitle}</span>
            <span className={styles.count}>
              {module.completed}/{module.total}
            </span>
          </button>
        </li>
      ))}
    </ol>
  );
}
