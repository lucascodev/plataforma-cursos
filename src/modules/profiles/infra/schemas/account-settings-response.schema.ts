import { accountSettingsSchema } from '@contracts/account/account-settings.schema';
import { z } from 'zod';

export const accountSettingsResponseSchema = z.object({ settings: accountSettingsSchema });
