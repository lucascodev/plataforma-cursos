import { isTimeZone } from '@contracts/is-time-zone';
import { useState, type FormEvent } from 'react';
import { readErrorMessage } from '@/shared/presentation/formatters/read-error-message';
import type { AccountSettings } from '../../../domain/entities/account-settings.entity';
import type { ThemePreference } from '../../../domain/types/theme-preference.type';
import { useUpdateSettingsMutation } from '../use-update-settings-mutation/use-update-settings-mutation';

export function useAccountSettingsForm(settings: AccountSettings) {
  const mutation = useUpdateSettingsMutation();
  const [timezone, setTimezone] = useState(settings.timezone);
  const [theme, setTheme] = useState<ThemePreference>(settings.theme);
  const [proposalUpdates, setProposalUpdates] = useState(settings.notify.proposalUpdates);
  const [weeklySummary, setWeeklySummary] = useState(settings.notify.weeklySummary);
  const timezoneError = isTimeZone(timezone) ? null : 'Use um fuso como America/Sao_Paulo.';

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (timezoneError) return;
    mutation.mutate({ timezone, theme, notify: { proposalUpdates, weeklySummary } });
  };

  return {
    timezone,
    theme,
    proposalUpdates,
    weeklySummary,
    timezoneError,
    isSaving: mutation.isPending,
    saved: mutation.isSuccess,
    error: mutation.isError ? readErrorMessage(mutation.error, 'Não foi possível salvar agora.') : null,
    setTimezone,
    setTheme,
    setProposalUpdates,
    setWeeklySummary,
    submit,
  };
}
