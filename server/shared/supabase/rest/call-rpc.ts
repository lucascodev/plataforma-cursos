import type { Services } from '../../../main/services.type';

export function callRpc(services: Services, name: string, args: Record<string, unknown>, accessToken?: string): Promise<Response> {
  return services.rest.request(`rpc/${name}`, { method: 'POST', body: args, accessToken });
}
