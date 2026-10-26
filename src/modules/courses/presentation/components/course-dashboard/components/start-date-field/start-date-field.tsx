import styles from './start-date-field.module.css';

interface StartDateFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function StartDateField({ value, onChange }: StartDateFieldProps) {
  return (
    <label className={styles.field}>
      <span>Início</span>
      <input type="date" value={value} required onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
