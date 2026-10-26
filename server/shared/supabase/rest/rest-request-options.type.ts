export interface RestRequestOptions {
  readonly method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  readonly accessToken?: string;
  readonly body?: unknown;
  readonly prefer?: string;
}
