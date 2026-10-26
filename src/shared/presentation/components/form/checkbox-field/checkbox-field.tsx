import type { InputHTMLAttributes, ReactNode } from 'react';
import styles from '../../../styles/form-field.module.css';

type CheckboxFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  children: ReactNode;
};

export function CheckboxField({ children, ...input }: CheckboxFieldProps) {
  return (
    <label className={styles.checkbox}>
      <input type="checkbox" {...input} />
      <span>{children}</span>
    </label>
  );
}
