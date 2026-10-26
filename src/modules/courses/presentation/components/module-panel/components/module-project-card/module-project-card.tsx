import type { ModuleView } from '../../../../types/module-view.type';
import { ItemCheck } from '../../../item-check/item-check';
import styles from './module-project-card.module.css';

interface ModuleProjectCardProps {
  project: ModuleView['project'];
  onDoneChange: (itemId: string, done: boolean) => void;
}

export function ModuleProjectCard({ project, onDoneChange }: ModuleProjectCardProps) {
  return (
    <article className={project.isDone ? `${styles.card} ${styles.done}` : styles.card}>
      <p className={styles.kicker}>Projeto do módulo</p>
      <h4 className={styles.title}>{project.title}</h4>
      <p className={styles.brief}>{project.brief}</p>
      <div className={styles.columns}>
        <div>
          <h5 className={styles.subtitle}>Requisitos</h5>
          <ul className={styles.list}>
            {project.requirements.map((requirement) => (
              <li key={requirement}>{requirement}</li>
            ))}
          </ul>
        </div>
        <div>
          <h5 className={styles.subtitle}>Está pronto quando</h5>
          <ul className={styles.list}>
            {project.doneCriteria.map((criterion) => (
              <li key={criterion}>{criterion}</li>
            ))}
          </ul>
        </div>
      </div>
      <ItemCheck label="Projeto entregue" checked={project.isDone} onChange={(done) => onDoneChange(project.itemId, done)} />
    </article>
  );
}
