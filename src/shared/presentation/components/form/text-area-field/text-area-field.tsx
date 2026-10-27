import { useId, type TextareaHTMLAttributes } from 'react';
import styles from '../../../styles/form-field.module.css';

type TextAreaFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  hint?: string;
  error?: string | null;
  isCode?: boolean;
};

export function TextAreaField({ label, hint, error, isCode = false, id, ...textarea }: TextAreaFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const describedBy = [hint ? `${fieldId}-hint` : null, error ? `${fieldId}-error` : null].filter(Boolean).join(' ');
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={fieldId}>
        {label}
      </label>
      <textarea
        id={fieldId}
        className={isCode ? `${styles.control} ${styles.code}` : styles.control}
        spellCheck={isCode ? false : undefined} aria-invalid={error ? true : undefined} aria-describedby={describedBy || undefined} {...textarea} />
      {hint ? (
        <p id={`${fieldId}-hint`} className={styles.hint}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${fieldId}-error`} className={styles.error}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
