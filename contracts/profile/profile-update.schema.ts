import { z } from 'zod';
import { profileLinkSchema } from './profile-link.schema.ts';

export const profileUpdateSchema = z.object({
  displayName: z.string().trim().min(1, 'Informe um nome.').max(80),
  // Optional so a tab running older code can still save the fields it knows.
  headline: z.string().trim().max(80, 'Use até 80 letras.').optional(),
  shortBio: z.string().trim().max(160, 'Use até 160 letras.').optional(),
  bio: z.string().trim().max(1000),
  links: z.array(profileLinkSchema).max(5, 'No máximo 5 links.'),
  showStudentCount: z.boolean(),
});

export type ProfileUpdateRecord = z.infer<typeof profileUpdateSchema>;
