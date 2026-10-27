import { describe, expect, it } from 'vitest';
import { handleVerifyLab } from '../modules/labs/handlers/handle-verify-lab';
import { handleSetLabCode } from '../modules/teaching/handlers/labs/handle-set-lab-code';
import { json, makeFakeServices, postgrestError } from './fakes/fake-supabase';
import { signedIn } from './fakes/test-requests';

describe('laboratórios', () => {
  it('verificar normaliza o código antes de mandar ao banco', async () => {
    const { services, calls } = makeFakeServices(() => json(true));
    const response = await handleVerifyLab(
      signedIn('/api/courses/curso/labs/m2-t1/verify', { method: 'POST', body: { code: ' lab-abcd 1234 ' } }),
      'curso',
      'm2-t1',
      services,
    );
    expect(await response.json()).toEqual({ completed: true });
    expect(calls[0]?.body).toEqual({ p_slug: 'curso', p_item_key: 'm2-t1', p_code: 'LAB-ABCD1234' });
  });

  it('código fora do formato nem chega ao banco', async () => {
    const { services, calls } = makeFakeServices(() => json(true));
    const response = await handleVerifyLab(signedIn('/api/courses/curso/labs/m2-t1/verify', { method: 'POST', body: { code: 'oi' } }), 'curso', 'm2-t1', services);
    expect(response.status).toBe(422);
    expect(calls).toHaveLength(0);
  });

  it('laboratório sem código registrado avisa em português', async () => {
    const { services } = makeFakeServices(() => postgrestError(409, 'PT409', 'lab-code-missing'));
    const response = await handleVerifyLab(
      signedIn('/api/courses/curso/labs/m2-t1/verify', { method: 'POST', body: { code: 'LAB-ABCD1234' } }),
      'curso',
      'm2-t1',
      services,
    );
    expect(response.status).toBe(409);
  });

  it('professor apaga o código mandando vazio', async () => {
    const { services, calls } = makeFakeServices(() => new Response(null, { status: 204 }));
    const response = await handleSetLabCode(
      signedIn('/api/teaching/courses/curso/lab-codes/m2-t1', { method: 'PUT', body: { code: '' } }),
      'curso',
      'm2-t1',
      services,
    );
    expect(response.status).toBe(204);
    expect(calls[0]?.body).toEqual({ p_slug: 'curso', p_item_key: 'm2-t1', p_code: '' });
  });
});
