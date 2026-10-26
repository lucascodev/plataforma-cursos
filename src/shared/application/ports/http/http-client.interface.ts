import type { HttpRequest } from './http-request.type';

export interface HttpClient {
  request(request: HttpRequest): Promise<unknown>;
}
