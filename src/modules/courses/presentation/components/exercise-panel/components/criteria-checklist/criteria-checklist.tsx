import { CheckboxField } from '@/shared/presentation/components/form/checkbox-field/checkbox-field';
import styles from '../../../../styles/exercise.module.css';

interface CriteriaChecklistProps {
  readonly criteria: readonly string[];
  readonly done: readonly number[];
  readonly onToggle: (index: number) => void;
}

export function CriteriaChecklist({ criteria, done, onToggle }: CriteriaChecklistProps) {
  return (
    <section className={styles.section} aria-labelledby="pronto-quando">
      <h3 id="pronto-quando" className={styles.heading}>
        Pronto quando <span className={styles.count}>{done.filter((index) => index < criteria.length).length} de {criteria.length}</span>
      </h3>
      <ul className={styles.list}>
        {criteria.map((criterion, index) => (
          <li key={criterion}>
            <CheckboxField checked={done.includes(index)} onChange={() => onToggle(index)}>
              {criterion}
            </CheckboxField>
          </li>
        ))}
      </ul>
    </section>
  );
}
