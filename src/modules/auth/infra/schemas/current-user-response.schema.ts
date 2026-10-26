import { z } from 'zod';
import { authUserSchema } from '@contracts/auth-user.schema';

export const currentUserResponseSchema = z.object({ user: authUserSchema });
