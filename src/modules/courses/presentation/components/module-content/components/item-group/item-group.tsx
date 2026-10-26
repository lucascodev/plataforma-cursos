import type { ReactNode } from 'react';
import styles from './item-group.module.css';

interface ItemGroupProps {
  title: string;
  children: ReactNode;
}

export function ItemGroup({ title, children }: ItemGroupProps) {
  return (
    <div className={styles.group}>
      <h4 className={styles.title}>{title}</h4>
      {children}
    </div>
  );
}
