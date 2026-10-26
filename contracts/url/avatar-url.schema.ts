import { z } from 'zod';

export const avatarUrlSchema = z.string().startsWith('https://avatars.githubusercontent.com/').max(300).nullable();
