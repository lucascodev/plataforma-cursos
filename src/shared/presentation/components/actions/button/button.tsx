import type { ButtonHTMLAttributes } from 'react';
import styles from './button.module.css';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: 'default' | 'primary' | 'danger';
};

export function Button({ tone = 'default', className, type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={[styles.button, styles[tone], className].filter(Boolean).join(' ')} {...props} />;
}
