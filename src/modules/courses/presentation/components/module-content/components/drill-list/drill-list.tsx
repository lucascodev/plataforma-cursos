import type { ModuleView } from '../../../../types/module/module-view.type';
import { CheckableItem } from '../checkable-item/checkable-item';
import { ItemGroup } from '../item-group/item-group';
import styles from './drill-list.module.css';

interface DrillListProps {
  drills: ModuleView['drills'];
  onDoneChange: (itemId: string, done: boolean) => void;
}

export function DrillList({ drills, onDoneChange }: DrillListProps) {
  return (
    <ItemGroup title="Exercícios de fixação">
      <ol className={styles.list}>
        {drills.map((drill) => (
          <CheckableItem
            key={drill.itemId}
            number={`E${drill.number}`}
            title={drill.title}
            isDone={drill.isDone}
            onDoneChange={(done) => onDoneChange(drill.itemId, done)}
          >
            <p>{drill.task}</p>
          </CheckableItem>
        ))}
      </ol>
    </ItemGroup>
  );
}
