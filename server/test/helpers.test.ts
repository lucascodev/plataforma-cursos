import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { isProfileHandle } from '../shared/http/is-profile-handle';
import { isUuid } from '../shared/http/is-uuid';
import { readJsonBody } from '../shared/http/read-json-body';
import { readPageOffset } from '../shared/http/read-page-offset';
import { readValidatedBody } from '../shared/http/read-validated-body';
import { upstreamProblem } from '../shared/http/upstream-problem';
import { postgrestError } from './fake-supabase';
import { SITE } from './test-requests';

const post = (body: string, type = 'application/json') => new Request(SITE, { method: 'POST', headers: { 'Content-Type': type }, body });

describe('helpers do servidor', () => {
  it('valida o corpo com o schema e responde 400, 413 ou 422', async () => {
    const schema = z.object({ name: z.string().min(1) });
    expect((await readValidatedBody(post('{"name":"Ana"}'), schema, 100)).ok).toBe(true);
    const invalid = await readValidatedBody(post('{"name":""}'), schema, 100);
    expect(invalid.ok ? 0 : invalid.response.status).toBe(422);
    const tooLarge = await readValidatedBody(post(JSON.stringify({ name: 'x'.repeat(200) })), schema, 100);
    expect(tooLarge.ok ? 0 : tooLarge.response.status).toBe(413);
    const wrongType = await readValidatedBody(post('name=Ana', 'text/plain'), schema, 100);
    expect(wrongType.ok ? 0 : wrongType.response.status).toBe(400);
  });

  it('para de ler o corpo sem Content-Length assim que passa do limite', async () => {
    const chunk = new TextEncoder().encode('x'.repeat(60));
    const stream = new ReadableStream<Uint8Array>({
      pull(controller) {
        controller.enqueue(chunk);
      },
    });
    const chunked = new Request(SITE, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: stream, duplex: 'half' } as RequestInit);
    await expect(readJsonBody(chunked, 100)).rejects.toMatchObject({ reason: 'too-large' });
  });

  it('traduz o hint do banco e nunca repassa o texto do Supabase', async () => {
    const known = await upstreamProblem(postgrestError(409, 'PT409', 'slug-taken'), { 'slug-taken': [409, 'Endereço em uso.'] }, 'Indisponível.');
    expect(known.status).toBe(409);
    expect(await known.json()).toEqual({ error: { code: 'slug-taken', message: 'Endereço em uso.' } });

    const forbidden = await upstreamProblem(postgrestError(403, '42501'), {}, 'Indisponível.');
    expect(forbidden.status).toBe(403);
    expect(JSON.stringify(await forbidden.json())).not.toContain('internal text');

    const unknown = await upstreamProblem(postgrestError(500, 'XX000'), {}, 'Indisponível.');
    expect(unknown.status).toBe(502);
  });

  it('confere parâmetros da URL', () => {
    expect(isUuid('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')).toBe(true);
    expect(isUuid('1 or 1=1')).toBe(false);
    expect(isProfileHandle('ana-dev')).toBe(true);
    expect(isProfileHandle('Ana')).toBe(false);
    expect(isProfileHandle('../x')).toBe(false);
    expect(readPageOffset(new URL(`${SITE}/?page=3`), 50)).toBe(100);
    expect(readPageOffset(new URL(`${SITE}/?page=-1`), 50)).toBe(0);
    expect(readPageOffset(new URL(`${SITE}/?page=abc`), 50)).toBe(0);
  });
});
