import type { ButtonHTMLAttributes } from 'react';
import styles from './button.module.css';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: 'default' | 'primary' | 'strong' | 'danger' | 'danger-solid' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
};

export function Button({ tone = 'default', size = 'sm', isLoading = false, className, type = 'button', disabled, children, ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={[styles.button, styles[tone], styles[size], className].filter(Boolean).join(' ')}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...props}
    >
      {isLoading ? <span className={styles.spinner} aria-hidden="true" /> : null}
      {children}
    </button>
  );
}
