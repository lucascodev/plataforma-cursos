import type { HttpClient } from '@/shared/application/ports/http-client.interface';
import { FetchHttpClient } from '@/shared/infra/http/fetch-http-client';

let client: HttpClient | null = null;

export function makeHttpClient(): HttpClient {
  client ??= new FetchHttpClient();
  return client;
}
