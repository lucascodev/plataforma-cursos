import { myProfileSchema } from '@contracts/my-profile.schema';
import { z } from 'zod';

export const myProfileResponseSchema = z.object({ profile: myProfileSchema });
