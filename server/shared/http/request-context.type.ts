import type { ServerEnv } from '../env/server-env.type';

// The subset of Cloudflare Pages' EventContext these functions use.
export interface RequestContext {
  readonly request: Request;
  readonly env: ServerEnv;
  readonly params: Readonly<Record<string, string | string[]>>;
  next(): Promise<Response>;
}
