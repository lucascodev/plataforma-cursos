import { Plus } from 'lucide-react';
import { Button } from '@/shared/presentation/components/actions/button/button';
import type { EditableModule } from '../../../../../domain/entities/draft/editable-module.entity';
import styles from './module-list.module.css';

interface ModuleListProps {
  readonly modules: readonly EditableModule[];
  readonly selectedIndex: number;
  readonly canAdd: boolean;
  readonly onSelect: (index: number) => void;
  readonly onAdd: () => void;
}

export function ModuleList({ modules, selectedIndex, canAdd, onSelect, onAdd }: ModuleListProps) {
  return (
    <nav className={styles.nav} aria-label="Módulos do curso">
      <ol className={styles.list}>
        {modules.map((module, index) => (
          <li key={module.id}>
            <button
              type="button"
              className={styles.module}
              aria-current={index === selectedIndex ? 'true' : undefined}
              onClick={() => onSelect(index)}
            >
              <span className={styles.code}>M{index + 1}</span>
              <span className={styles.title}>{module.shortTitle || module.title || 'Módulo sem nome'}</span>
            </button>
          </li>
        ))}
      </ol>
      <Button disabled={!canAdd} onClick={onAdd}>
        <Plus size={16} aria-hidden="true" />
        Adicionar módulo
      </Button>
    </nav>
  );
}
