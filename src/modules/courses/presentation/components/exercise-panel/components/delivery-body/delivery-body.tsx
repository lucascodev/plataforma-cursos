import { TextAreaField } from '@/shared/presentation/components/form/text-area-field/text-area-field';
import { TextField } from '@/shared/presentation/components/form/text-field/text-field';
import type { ExerciseView } from '../../../../types/exercise/exercise-view.type';
import styles from '../../../../styles/exercise.module.css';

type Delivery = Extract<ExerciseView['exercise'], { type: 'delivery' }>;

export function DeliveryBody({ exercise, view }: { readonly exercise: Delivery; readonly view: ExerciseView }) {
  return (
    <section className={styles.section} aria-labelledby="entrega">
      <h3 id="entrega" className={styles.heading}>
        Entrega
      </h3>
      {exercise.deliver !== 'text' ? (
        <TextField
          label="Link do repositório ou do commit"
          type="url"
          inputMode="url"
          placeholder="https://"
          value={view.deliveryUrlDraft}
          error={view.deliveryUrlError}
          onChange={(event) => view.setDeliveryUrl(event.target.value)}
        />
      ) : null}
      {exercise.deliver !== 'link' ? (
        <TextAreaField label="Sua resposta" rows={5} maxLength={2000} value={view.state.deliveryText} onChange={(event) => view.setDeliveryText(event.target.value)} />
      ) : null}
      <p className={styles.muted}>A entrega fica com você. O professor vê só quantas pessoas entregaram.</p>
    </section>
  );
}
