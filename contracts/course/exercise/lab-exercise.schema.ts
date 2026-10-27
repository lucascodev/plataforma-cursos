import { z } from 'zod';
import { exerciseCommonShape } from './exercise-common.schema.ts';
import { exercisePartIdSchema } from './exercise-part-id.schema.ts';
import { exerciseText } from './exercise-text.ts';
import { hasUniqueIds } from './has-unique-ids.ts';

const GITHUB_REPO = /^https:\/\/github\.com\/[A-Za-z0-9-]{1,39}\/[A-Za-z0-9._-]{1,100}$/;

// browser: files and checks run in the isolated runner. codespaces and local: the repository's own script runs the
// checks and prints a completion code, checked by the database against the code the teacher registered.
export const labExerciseSchema = z
  .object({
    type: z.literal('lab'),
    ...exerciseCommonShape,
    environment: z.enum(['browser', 'codespaces', 'local']),
    runtime: z.enum(['python', 'javascript']).optional(),
    repoUrl: z.string().regex(GITHUB_REPO, 'Use o endereço de um repositório do GitHub, como https://github.com/usuario/repositorio.').optional(),
    setup: z.array(exerciseText(400)).max(10).optional(),
    files: z
      .array(z.object({ name: z.string().regex(/^[A-Za-z0-9_.-]{1,60}$/, 'Nome de arquivo inválido.'), content: z.string().max(20_000) }))
      .max(10)
      .optional(),
    checks: z
      .array(z.object({ id: exercisePartIdSchema('c'), title: exerciseText(200), test: z.string().max(10_000).optional() }))
      .min(1)
      .max(15),
  })
  .refine((lab) => hasUniqueIds(lab.checks), { message: 'Há etapas com o mesmo id.', path: ['checks'] })
  .refine((lab) => lab.environment === 'browser' || lab.repoUrl !== undefined, {
    message: 'Informe o repositório do laboratório.',
    path: ['repoUrl'],
  })
  .refine((lab) => lab.environment !== 'browser' || (lab.runtime !== undefined && lab.checks.every((check) => check.test?.trim())), {
    message: 'No navegador, escolha a linguagem e escreva o teste de cada etapa.',
    path: ['checks'],
  });
