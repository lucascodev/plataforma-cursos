import type { ModuleView } from '../../../../types/module-view.type';
import { CheckableItem } from '../checkable-item/checkable-item';
import { ItemGroup } from '../item-group/item-group';
import styles from './lesson-list.module.css';

interface LessonListProps {
  lessons: ModuleView['lessons'];
  onDoneChange: (itemId: string, done: boolean) => void;
}

export function LessonList({ lessons, onDoneChange }: LessonListProps) {
  return (
    <ItemGroup title="Aulas">
      <ol className={styles.list}>
        {lessons.map((lesson) => (
          <CheckableItem
            key={lesson.itemId}
            number={lesson.number}
            title={lesson.title}
            isDone={lesson.isDone}
            onDoneChange={(done) => onDoneChange(lesson.itemId, done)}
          >
            <p>{lesson.summary}</p>
            <p className={styles.exercise}>
              <strong>Exercício:</strong> {lesson.exercise}
            </p>
          </CheckableItem>
        ))}
      </ol>
    </ItemGroup>
  );
}
