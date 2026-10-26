import type { AccountSettingsRecord } from '../../../contracts/account/account-settings.schema';

export const DEFAULT_ACCOUNT_SETTINGS: AccountSettingsRecord = {
  timezone: 'America/Sao_Paulo',
  theme: 'system',
  notify: { proposalUpdates: true, weeklySummary: false },
};
