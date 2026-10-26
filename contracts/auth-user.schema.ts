import { z } from 'zod';

export const authUserSchema = z.object({
  id: z.string().min(1).max(100),
  displayName: z.string().min(1).max(80),
  avatarUrl: z.string().startsWith('https://avatars.githubusercontent.com/').max(300).nullable(),
});

export type AuthUserRecord = z.infer<typeof authUserSchema>;
