import { Button } from '@/shared/presentation/components/actions/button/button';
import { Notice } from '@/shared/presentation/components/feedback/notice/notice';
import { SelectField } from '@/shared/presentation/components/form/select-field/select-field';
import { TextAreaField } from '@/shared/presentation/components/form/text-area-field/text-area-field';
import { TextField } from '@/shared/presentation/components/form/text-field/text-field';
import type { ProposalDraft } from '../../../domain/entities/proposal-draft.entity';
import { useProposalForm } from '../../hooks/use-proposal-form/use-proposal-form';
import { OutlineEditor } from './components/outline-editor/outline-editor';
import styles from './proposal-form.module.css';

const AREAS = ['Programação', 'Dados', 'Inteligência artificial', 'Infraestrutura', 'Design', 'Produto', 'Segurança', 'Outra área'].map((area) => ({
  value: area,
  label: area,
}));

const LANGUAGES = [
  { value: 'pt-BR', label: 'Português' },
  { value: 'en-US', label: 'Inglês' },
  { value: 'es-ES', label: 'Espanhol' },
] as const;

interface ProposalFormProps {
  initial: ProposalDraft | null;
  submitLabel: string;
  isSubmitting: boolean;
  serverError: string | null;
  onSubmit: (draft: ProposalDraft) => void;
}

export function ProposalForm({ initial, submitLabel, isSubmitting, serverError, onSubmit }: ProposalFormProps) {
  const form = useProposalForm(initial, onSubmit);
  const { draft, errors } = form;

  return (
    <form className={styles.form} onSubmit={form.submit} noValidate>
      <TextField label="Título do curso" value={draft.title} maxLength={120} error={errors.title} onChange={(event) => form.set('title', event.target.value)} />
      <TextAreaField
        label="Do que trata o curso"
        hint="O que a pessoa vai conseguir fazer no fim e como o curso chega lá."
        value={draft.summary}
        maxLength={2000}
        error={errors.summary}
        onChange={(event) => form.set('summary', event.target.value)}
      />
      <TextField
        label="Para quem é"
        hint="Ex.: pessoas que já programam em Python e querem trabalhar com IA."
        value={draft.audience}
        maxLength={400}
        error={errors.audience}
        onChange={(event) => form.set('audience', event.target.value)}
      />
      <div className={styles.pair}>
        <SelectField label="Área" options={AREAS} value={draft.area} onChange={(event) => form.set('area', event.target.value)} />
        <SelectField label="Idioma" options={LANGUAGES} value={draft.language} onChange={(event) => form.set('language', event.target.value)} />
      </div>
      <OutlineEditor
        modules={draft.outline}
        error={errors.outline}
        canAdd={form.canAddModule}
        onAdd={form.addModule}
        onChange={form.updateModule}
        onRemove={form.removeModule}
        onMove={form.moveModule}
      />
      <TextAreaField
        label="Sua experiência com o tema (opcional)"
        value={draft.experience}
        maxLength={2000}
        onChange={(event) => form.set('experience', event.target.value)}
      />
      <div className={styles.pair}>
        <TextField
          label="Link de uma amostra (opcional)"
          hint="Um texto, vídeo ou repositório seu sobre o assunto."
          type="url"
          inputMode="url"
          placeholder="https://"
          value={draft.sampleUrl ?? ''}
          maxLength={300}
          error={errors.sampleUrl}
          onChange={(event) => form.set('sampleUrl', event.target.value)}
        />
        <TextField
          label="Endereço sugerido (opcional)"
          hint="Vira /cursos/endereco. Letras minúsculas, números e hífens."
          value={draft.suggestedSlug ?? ''}
          maxLength={60}
          error={errors.suggestedSlug}
          onChange={(event) => form.set('suggestedSlug', event.target.value.toLowerCase())}
        />
      </div>
      {form.hasErrors ? <Notice tone="warning">Confira os campos marcados.</Notice> : null}
      {serverError ? <Notice tone="warning">{serverError}</Notice> : null}
      <div>
        <Button type="submit" tone="primary" disabled={isSubmitting}>
          {isSubmitting ? 'Enviando…' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
