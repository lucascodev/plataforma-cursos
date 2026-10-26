import { ItemGroup } from '../item-group/item-group';
import styles from './self-check-list.module.css';

interface SelfCheckListProps {
  items: readonly string[];
}

export function SelfCheckList({ items }: SelfCheckListProps) {
  return (
    <ItemGroup title="Autoavaliação">
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </ItemGroup>
  );
}
