import { z } from 'zod';
import { profileLinkSchema } from './profile-link.schema';

export const profileUpdateSchema = z.object({
  displayName: z.string().trim().min(1, 'Informe um nome.').max(80),
  bio: z.string().trim().max(1000),
  links: z.array(profileLinkSchema).max(5, 'No máximo 5 links.'),
  showStudentCount: z.boolean(),
});

export type ProfileUpdateRecord = z.infer<typeof profileUpdateSchema>;
