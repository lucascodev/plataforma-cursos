import { z } from 'zod';
import { authUserSchema } from '@contracts/profile/auth-user.schema';

export const currentUserResponseSchema = z.object({ user: authUserSchema });
