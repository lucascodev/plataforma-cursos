import { myProfileSchema } from '@contracts/profile/my-profile.schema';
import { z } from 'zod';

export const myProfileResponseSchema = z.object({ profile: myProfileSchema });
