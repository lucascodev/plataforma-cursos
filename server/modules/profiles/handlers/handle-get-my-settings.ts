import { z } from 'zod';
import { accountSettingsSchema } from '../../../../contracts/account-settings.schema';
import type { Services } from '../../../main/services.type';
import { jsonResponse } from '../../../shared/http/json-response';
import { problemResponse } from '../../../shared/http/problem-response';
import { withSession } from '../../auth/with-session';
import { DEFAULT_ACCOUNT_SETTINGS } from '../default-account-settings';

// Settings saved under older rules (or never saved) fall back field by field to the defaults.
const storedSettingsSchema = z.object({
  timezone: accountSettingsSchema.shape.timezone.catch(DEFAULT_ACCOUNT_SETTINGS.timezone),
  theme: accountSettingsSchema.shape.theme.catch(DEFAULT_ACCOUNT_SETTINGS.theme),
  notify: z
    .object({
      proposalUpdates: z.boolean().catch(DEFAULT_ACCOUNT_SETTINGS.notify.proposalUpdates),
      weeklySummary: z.boolean().catch(DEFAULT_ACCOUNT_SETTINGS.notify.weeklySummary),
    })
    .catch(DEFAULT_ACCOUNT_SETTINGS.notify),
});

export function handleGetMySettings(request: Request, services: Services): Promise<Response> {
  return withSession(request, services, async (session) => {
    const response = await services.rest.request(
      `account_settings?user_id=eq.${encodeURIComponent(session.userId)}&select=timezone,theme,notify&limit=1`,
      { accessToken: session.accessToken },
    );
    if (response.status === 401) return response;
    if (!response.ok) return problemResponse(502, 'unavailable', 'Não foi possível carregar suas preferências agora.');
    const rows: unknown = await response.json().catch(() => null);
    const first = Array.isArray(rows) ? rows[0] : undefined;
    const settings = first ? storedSettingsSchema.parse(first) : DEFAULT_ACCOUNT_SETTINGS;
    return jsonResponse({ settings });
  });
}
