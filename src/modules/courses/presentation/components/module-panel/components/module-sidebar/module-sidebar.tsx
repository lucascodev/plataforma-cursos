import type { Resource } from '../../../../../domain/entities/course/resource.entity';
import styles from './module-sidebar.module.css';
import { ModuleNotes } from './components/module-notes/module-notes';
import { ResourceList } from './components/resource-list/resource-list';

interface ModuleSidebarProps {
  resources: readonly Resource[];
  note: string;
  onNoteChange: (text: string) => void;
}

export function ModuleSidebar({ resources, note, onNoteChange }: ModuleSidebarProps) {
  return (
    <aside className={styles.sidebar}>
      {resources.length > 0 ? <ResourceList resources={resources} /> : null}
      <ModuleNotes value={note} onChange={onNoteChange} />
    </aside>
  );
}
