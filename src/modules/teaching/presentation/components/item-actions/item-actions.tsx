import { ArrowDown, ArrowUp, Trash2 } from 'lucide-react';
import { Button } from '@/shared/presentation/components/actions/button/button';
import styles from '../../styles/editor.module.css';

interface ItemActionsProps {
  readonly label: string;
  readonly index: number;
  readonly count: number;
  readonly onMove: (delta: number) => void;
  readonly onRemove: () => void;
}

export function ItemActions({ label, index, count, onMove, onRemove }: ItemActionsProps) {
  return (
    <div className={styles.actions}>
      <Button tone="ghost" aria-label={`Subir ${label}`} disabled={index === 0} onClick={() => onMove(-1)}>
        <ArrowUp size={16} aria-hidden="true" />
      </Button>
      <Button tone="ghost" aria-label={`Descer ${label}`} disabled={index === count - 1} onClick={() => onMove(1)}>
        <ArrowDown size={16} aria-hidden="true" />
      </Button>
      <Button tone="ghost" aria-label={`Remover ${label}`} onClick={onRemove}>
        <Trash2 size={16} aria-hidden="true" />
      </Button>
    </div>
  );
}
