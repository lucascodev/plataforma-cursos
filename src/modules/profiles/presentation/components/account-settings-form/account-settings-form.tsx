import { Button } from '@/shared/presentation/components/actions/button/button';
import { Notice } from '@/shared/presentation/components/feedback/notice/notice';
import { CheckboxField } from '@/shared/presentation/components/form/checkbox-field/checkbox-field';
import { SelectField } from '@/shared/presentation/components/form/select-field/select-field';
import { TextField } from '@/shared/presentation/components/form/text-field/text-field';
import type { AccountSettings } from '../../../domain/entities/account-settings.entity';
import type { ThemePreference } from '../../../domain/types/theme-preference.type';
import { useAccountSettingsForm } from '../../hooks/use-account-settings-form/use-account-settings-form';
import styles from './account-settings-form.module.css';

const THEME_OPTIONS = [
  { value: 'system', label: 'Igual ao aparelho' },
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Escuro' },
] as const;

const isTheme = (value: string): value is ThemePreference => THEME_OPTIONS.some((option) => option.value === value);

export function AccountSettingsForm({ settings }: { settings: AccountSettings }) {
  const form = useAccountSettingsForm(settings);

  return (
    <form className={styles.form} onSubmit={form.submit} noValidate>
      <SelectField
        label="Tema"
        options={THEME_OPTIONS}
        value={form.theme}
        onChange={(event) => {
          if (isTheme(event.target.value)) form.setTheme(event.target.value);
        }}
      />
      <TextField
        label="Fuso horário"
        hint="Guardado para os avisos. O plano de estudo segue o horário do seu aparelho."
        value={form.timezone}
        error={form.timezoneError}
        maxLength={64}
        onChange={(event) => form.setTimezone(event.target.value.trim())}
      />
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Avisos</legend>
        <CheckboxField checked={form.proposalUpdates} onChange={(event) => form.setProposalUpdates(event.target.checked)}>
          Quando uma proposta minha for analisada
        </CheckboxField>
        <CheckboxField checked={form.weeklySummary} onChange={(event) => form.setWeeklySummary(event.target.checked)}>
          Resumo semanal dos meus estudos
        </CheckboxField>
        <p className={styles.note}>Os avisos por e-mail ainda não são enviados. Sua escolha fica guardada para quando estiverem prontos.</p>
      </fieldset>
      {form.error ? <Notice tone="warning">{form.error}</Notice> : null}
      {form.saved && !form.error ? <Notice tone="success">Preferências salvas.</Notice> : null}
      <div>
        <Button type="submit" tone="primary" disabled={form.isSaving || form.timezoneError !== null}>
          {form.isSaving ? 'Salvando…' : 'Salvar preferências'}
        </Button>
      </div>
    </form>
  );
}
