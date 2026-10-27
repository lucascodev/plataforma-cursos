import { Check, CloudOff, LoaderCircle, Pencil, TriangleAlert } from 'lucide-react';
import type { SaveStatus } from '../../types/save-status.type';
import styles from './save-status-label.module.css';

const LABELS: Readonly<Record<SaveStatus, string>> = {
  saved: 'Salvo',
  pending: 'Alterações não salvas',
  saving: 'Salvando…',
  error: 'Não foi possível salvar',
  conflict: 'Alterado em outra aba',
};

const ICONS = { saved: Check, pending: Pencil, saving: LoaderCircle, error: CloudOff, conflict: TriangleAlert } as const;

export function SaveStatusLabel({ status }: { readonly status: SaveStatus }) {
  const Icon = ICONS[status];
  return (
    <span className={`${styles.label} ${styles[status]}`} role="status" aria-live="polite">
      <Icon size={16} aria-hidden="true" />
      {LABELS[status]}
    </span>
  );
}
