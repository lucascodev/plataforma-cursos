import { z } from 'zod';

export const versionChangesRequestSchema = z.object({
  revision: z.number().int().min(1),
  items: z
    .array(z.string().trim().min(1).max(500, 'Use até 500 letras por ponto.'))
    .min(1, 'Liste pelo menos um ponto para ajustar.')
    .max(20, 'No máximo 20 pontos.'),
});

export type VersionChangesRequestRecord = z.infer<typeof versionChangesRequestSchema>;
