import type { ServerConfig } from '../../env/server-config.type';
import type { RestRequestOptions } from './rest-request-options.type';

export class SupabaseRestClient {
  constructor(
    private readonly config: ServerConfig,
    private readonly fetcher: typeof fetch = fetch,
  ) {}

  request(pathWithQuery: string, options: RestRequestOptions = {}): Promise<Response> {
    const headers: Record<string, string> = { apikey: this.config.publishableKey, Accept: 'application/json' };
    if (options.accessToken) headers.Authorization = `Bearer ${options.accessToken}`;
    if (options.prefer) headers.Prefer = options.prefer;
    if (options.body !== undefined) headers['Content-Type'] = 'application/json';
    return this.fetcher(`${this.config.supabaseUrl}/rest/v1/${pathWithQuery}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  }
}
