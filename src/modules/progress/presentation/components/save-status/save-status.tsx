import type { SaveState } from '../../hooks/use-course-progress/save-state.type';
import styles from './save-status.module.css';

interface SaveStatusProps {
  saveState: SaveState;
}

const SAVE_TEXT: Record<SaveState, string> = {
  idle: 'Salvo na sua conta',
  pending: 'Salvando…',
  saving: 'Salvando…',
  saved: 'Salvo na sua conta',
  error: 'Não foi possível salvar. Tentando de novo…',
};

export function SaveStatus({ saveState }: SaveStatusProps) {
  return (
    <span className={saveState === 'error' ? `${styles.status} ${styles.error}` : styles.status} role="status">
      {SAVE_TEXT[saveState]}
    </span>
  );
}
