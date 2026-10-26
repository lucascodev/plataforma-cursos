import { describe, expect, it } from 'vitest';
import { accountSettingsSchema } from './account-settings.schema';

const valid = { timezone: 'America/Sao_Paulo', theme: 'system', notify: { proposalUpdates: true, weeklySummary: false } };

describe('accountSettingsSchema', () => {
  it('accepts real time zones', () => {
    expect(accountSettingsSchema.safeParse(valid).success).toBe(true);
    expect(accountSettingsSchema.safeParse({ ...valid, timezone: 'America/Argentina/Buenos_Aires' }).success).toBe(true);
  });

  it('refuses unknown time zones and themes', () => {
    expect(accountSettingsSchema.safeParse({ ...valid, timezone: 'Lua/Base' }).success).toBe(false);
    expect(accountSettingsSchema.safeParse({ ...valid, theme: 'neon' }).success).toBe(false);
  });
});
