import { ProgressMeter } from '@/shared/presentation/components/feedback/progress-meter/progress-meter';
import type { ModuleView } from '../../types/module/module-view.type';
import styles from './module-panel.module.css';
import { DrillList } from './components/drill-list/drill-list';
import { LessonList } from './components/lesson-list/lesson-list';
import { ModuleProjectCard } from './components/module-project-card/module-project-card';
import { ModuleSidebar } from './components/module-sidebar/module-sidebar';
import { SelfCheckList } from './components/self-check-list/self-check-list';

interface ModulePanelProps {
  module: ModuleView;
  isOpen: boolean;
  onToggle: () => void;
  onItemDoneChange: (itemId: string, done: boolean) => void;
  onNoteChange: (text: string) => void;
}

export function ModulePanel({ module, isOpen, onToggle, onItemDoneChange, onNoteChange }: ModulePanelProps) {
  const bodyId = `modulo-${module.id}-conteudo`;
  const panelClass = [styles.panel, module.isCurrent ? styles.current : '', module.kind === 'capstone' ? styles.capstone : ''].filter(Boolean).join(' ');

  return (
    <section id={`modulo-${module.id}`} className={panelClass} aria-labelledby={`modulo-${module.id}-titulo`}>
      <h3 className={styles.heading} id={`modulo-${module.id}-titulo`}>
        <button type="button" className={styles.toggle} aria-expanded={isOpen} aria-controls={bodyId} onClick={onToggle}>
          <span className={styles.number}>M{module.number}</span>
          <span className={styles.titles}>
            <span className={styles.title}>{module.title}</span>
            <span className={styles.subtitle}>{module.subtitle}</span>
          </span>
          <span className={styles.count}>
            {module.completed}/{module.total}
          </span>
          <span className={styles.chevron} aria-hidden="true">
            {isOpen ? '−' : '+'}
          </span>
        </button>
      </h3>
      <ProgressMeter className={styles.meter} value={module.completed} max={module.total} label={`Progresso do módulo ${module.number}`} />
      {isOpen ? (
        <div id={bodyId} className={styles.body}>
          <div className={styles.main}>
            <dl className={styles.intro}>
              <dt>Objetivo</dt>
              <dd>{module.goal}</dd>
              <dt>Antes de começar</dt>
              <dd>{module.prerequisite}</dd>
              <dt>Caso de estudo</dt>
              <dd>{module.caseStudy}</dd>
            </dl>
            {module.lowSpecTip ? (
              <p className={styles.tip}>
                <strong>Computador modesto:</strong> {module.lowSpecTip}
              </p>
            ) : null}
            <LessonList lessons={module.lessons} onDoneChange={onItemDoneChange} />
            {module.drills.length > 0 ? <DrillList drills={module.drills} onDoneChange={onItemDoneChange} /> : null}
            <ModuleProjectCard project={module.project} onDoneChange={onItemDoneChange} />
            {module.selfCheck.length > 0 ? <SelfCheckList items={module.selfCheck} /> : null}
          </div>
          <ModuleSidebar resources={module.resources} note={module.note} onNoteChange={onNoteChange} />
        </div>
      ) : null}
    </section>
  );
}
