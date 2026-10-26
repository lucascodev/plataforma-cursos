import { useRef, type KeyboardEvent } from 'react';
import type { TabItem } from '../../../types/navigation/tab-item.type';
import styles from './tabs.module.css';

interface TabsProps {
  readonly label: string;
  readonly items: readonly TabItem[];
  readonly selectedId: string;
  /** The panel for each tab must have id `${idPrefix}-panel-${tab.id}` and aria-labelledby `${idPrefix}-tab-${tab.id}`. */
  readonly idPrefix: string;
  readonly onSelect: (id: string) => void;
}

const KEY_STEPS: Readonly<Record<string, number>> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };

function targetIndex(key: string, current: number, count: number): number | null {
  if (key === 'Home') return 0;
  if (key === 'End') return count - 1;
  const step = KEY_STEPS[key];
  return step === undefined ? null : (current + step + count) % count;
}

// WAI-ARIA tabs with automatic activation: arrow keys move and select, only the selected tab is in the tab order.
export function Tabs({ label, items, selectedId, idPrefix, onSelect }: TabsProps) {
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const next = targetIndex(event.key, index, items.length);
    const item = next === null ? undefined : items[next];
    if (next === null || !item) return;
    event.preventDefault();
    onSelect(item.id);
    buttons.current[next]?.focus();
  };

  return (
    <div className={styles.tabs} role="tablist" aria-label={label}>
      {items.map((item, index) => {
        const isSelected = item.id === selectedId;
        return (
          <button
            key={item.id}
            ref={(element) => {
              buttons.current[index] = element;
            }}
            type="button"
            role="tab"
            id={`${idPrefix}-tab-${item.id}`}
            aria-selected={isSelected}
            aria-controls={`${idPrefix}-panel-${item.id}`}
            tabIndex={isSelected ? 0 : -1}
            className={styles.tab}
            onClick={() => onSelect(item.id)}
            onKeyDown={(event) => onKeyDown(event, index)}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
