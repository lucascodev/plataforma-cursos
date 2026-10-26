import type { z } from 'zod';
import { problemResponse } from '../responses/problem-response';
import { readJsonBody } from './read-json-body';
import { RequestBodyError } from './request-body-error';

export type ValidatedBody<T> = { readonly ok: true; readonly data: T } | { readonly ok: false; readonly response: Response };

export async function readValidatedBody<T>(request: Request, schema: z.ZodType<T>, maxBytes: number): Promise<ValidatedBody<T>> {
  let body: unknown;
  try {
    body = await readJsonBody(request, maxBytes);
  } catch (error) {
    const tooLarge = error instanceof RequestBodyError && error.reason === 'too-large';
    return { ok: false, response: problemResponse(tooLarge ? 413 : 400, 'invalid-body', tooLarge ? 'Os dados passaram do tamanho máximo.' : 'Dados inválidos.') };
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return { ok: false, response: problemResponse(422, 'invalid-input', 'Confira os dados enviados.') };
  return { ok: true, data: parsed.data };
}
