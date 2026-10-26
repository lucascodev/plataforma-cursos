import type { ModuleView } from '../../types/module/module-view.type';
import { DrillList } from './components/drill-list/drill-list';
import { LessonList } from './components/lesson-list/lesson-list';
import { ModuleProjectCard } from './components/module-project-card/module-project-card';
import { ModuleSidebar } from './components/module-sidebar/module-sidebar';
import { SelfCheckList } from './components/self-check-list/self-check-list';
import styles from './module-content.module.css';

interface ModuleContentProps {
  readonly module: ModuleView;
  readonly onItemDoneChange: (itemId: string, done: boolean) => void;
  readonly onNoteChange: (text: string) => void;
}

export function ModuleContent({ module, onItemDoneChange, onNoteChange }: ModuleContentProps) {
  return (
    <div className={styles.body}>
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
  );
}
