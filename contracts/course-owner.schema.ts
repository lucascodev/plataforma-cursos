import { z } from 'zod';
import { PROFILE_HANDLE_PATTERN } from './profile-handle-pattern';

export const courseOwnerSchema = z.object({
  handle: z.string().trim().toLowerCase().regex(PROFILE_HANDLE_PATTERN, 'Endereço de perfil inválido.'),
});

export type CourseOwnerRecord = z.infer<typeof courseOwnerSchema>;
