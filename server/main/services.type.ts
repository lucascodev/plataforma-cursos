import type { ServerConfig } from '../shared/env/server-config.type';
import type { SupabaseAuthClient } from '../shared/supabase/supabase-auth-client';
import type { SupabaseRestClient } from '../shared/supabase/supabase-rest-client';

export interface Services {
  readonly config: ServerConfig;
  readonly auth: SupabaseAuthClient;
  readonly rest: SupabaseRestClient;
  readonly now: () => number;
}
