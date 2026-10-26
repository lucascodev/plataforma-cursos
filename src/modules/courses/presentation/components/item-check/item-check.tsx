import styles from './item-check.module.css';

interface ItemCheckProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function ItemCheck({ label, checked, onChange }: ItemCheckProps) {
  return (
    <label className={styles.check}>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span>{label}</span>
    </label>
  );
}
