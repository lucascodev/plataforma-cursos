import { z } from 'zod';
import { courseSlugSchema } from '../course/course-slug.schema';
import { httpsUrlSchema } from '../url/https-url.schema';

export const proposalInputSchema = z.object({
  title: z.string().trim().min(3, 'Use pelo menos 3 letras.').max(120),
  summary: z.string().trim().min(1, 'Conte do que trata o curso.').max(2000),
  audience: z.string().trim().min(1, 'Diga para quem é o curso.').max(400),
  area: z.string().trim().min(1, 'Escolha uma área.').max(60),
  language: z.string().regex(/^[a-z]{2}(-[A-Z]{2})?$/),
  outline: z.array(z.string().trim().min(1).max(120)).min(1, 'Liste pelo menos um módulo.').max(30),
  experience: z.string().trim().max(2000),
  sampleUrl: httpsUrlSchema.nullable(),
  suggestedSlug: courseSlugSchema.nullable(),
});

export type ProposalInputRecord = z.infer<typeof proposalInputSchema>;
