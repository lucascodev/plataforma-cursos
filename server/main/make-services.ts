import { readServerConfig } from '../shared/env/read-server-config';
import type { ServerEnv } from '../shared/env/server-env.type';
import { SupabaseAuthClient } from '../shared/supabase/auth/supabase-auth-client';
import { SupabaseRestClient } from '../shared/supabase/rest/supabase-rest-client';
import type { Services } from './services.type';

export function makeServices(env: ServerEnv): Services {
  const config = readServerConfig(env);
  const fetcher: typeof fetch = (input, init) => fetch(input, init);
  return {
    config,
    auth: new SupabaseAuthClient(config, fetcher),
    rest: new SupabaseRestClient(config, fetcher),
    now: () => Date.now(),
  };
}
