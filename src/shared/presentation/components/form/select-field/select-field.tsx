import { useId, type SelectHTMLAttributes } from 'react';
import styles from '../../../styles/form-field.module.css';

interface SelectOption {
  readonly value: string;
  readonly label: string;
}

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: readonly SelectOption[];
  hint?: string;
};

export function SelectField({ label, options, hint, id, ...select }: SelectFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={fieldId}>
        {label}
      </label>
      <select id={fieldId} className={styles.control} aria-describedby={hint ? `${fieldId}-hint` : undefined} {...select}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hint ? (
        <p id={`${fieldId}-hint`} className={styles.hint}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
