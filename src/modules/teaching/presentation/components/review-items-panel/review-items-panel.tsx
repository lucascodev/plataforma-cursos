import { CheckboxField } from '@/shared/presentation/components/form/checkbox-field/checkbox-field';
import type { ReviewItem } from '../../../domain/entities/versions/review-item.entity';
import { formatShortDate } from '../../formatters/format-short-date';
import styles from './review-items-panel.module.css';

interface ReviewItemsPanelProps {
  readonly items: readonly ReviewItem[];
  readonly reviewedAt: string | null;
  readonly isBusy: boolean;
  readonly onToggle: (itemId: string, resolved: boolean) => void;
}

export function ReviewItemsPanel({ items, reviewedAt, isBusy, onToggle }: ReviewItemsPanelProps) {
  return (
    <section className={styles.panel} aria-labelledby="ajustes-pedidos">
      <h2 id="ajustes-pedidos" className={styles.title}>
        Ajustes pedidos na revisão
      </h2>
      <p className={styles.note}>Equipe da plataforma{reviewedAt ? ` · ${formatShortDate(reviewedAt)}` : ''}. Marque cada ponto quando fizer o ajuste.</p>
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.id}>
            <CheckboxField checked={item.resolved} disabled={isBusy} onChange={(event) => onToggle(item.id, event.target.checked)}>
              {item.text}
            </CheckboxField>
          </li>
        ))}
      </ul>
    </section>
  );
}
