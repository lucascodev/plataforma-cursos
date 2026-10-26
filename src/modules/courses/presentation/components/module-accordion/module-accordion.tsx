import type { ModuleAccordionView } from '../../types/module/module-accordion-view.type';
import styles from './module-accordion.module.css';

export function ModuleAccordion({ modules }: { readonly modules: readonly ModuleAccordionView[] }) {
  return (
    <ol className={styles.list}>
      {modules.map((module) => (
        <li key={module.id} className={styles.item}>
          <details className={styles.details}>
            <summary className={styles.summary}>
              <span className={styles.code}>{module.code}</span>
              <span className={styles.heading}>
                <span className={styles.title}>{module.title}</span>
                <span className={styles.meta}>{module.meta}</span>
              </span>
              <span className={styles.project}>{module.projectTitle}</span>
              <span className={styles.sign} aria-hidden="true" />
            </summary>
            <div className={styles.body}>
              <div>
                <p className={styles.label}>Objetivo</p>
                <p className={styles.goal}>{module.goal}</p>
              </div>
              <div>
                <p className={styles.label}>Aulas</p>
                <ol className={styles.lessons}>
                  {module.lessons.map((lesson) => (
                    <li key={lesson}>{lesson}</li>
                  ))}
                </ol>
              </div>
            </div>
          </details>
        </li>
      ))}
    </ol>
  );
}
