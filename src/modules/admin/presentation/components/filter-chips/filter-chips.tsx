import styles from './filter-chips.module.css';

interface FilterChipsProps<T extends string> {
  readonly label: string;
  readonly options: readonly { readonly value: T | null; readonly label: string }[];
  readonly selected: T | null;
  readonly onSelect: (value: T | null) => void;
}

export function FilterChips<T extends string>({ label, options, selected, onSelect }: FilterChipsProps<T>) {
  return (
    <div className={styles.chips} role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value ?? 'all'}
          type="button"
          className={styles.chip}
          aria-pressed={option.value === selected}
          onClick={() => onSelect(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
