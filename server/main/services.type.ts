import type { ServerConfig } from '../shared/env/server-config.type';
import type { SupabaseAuthClient } from '../shared/supabase/auth/supabase-auth-client';
import type { SupabaseRestClient } from '../shared/supabase/rest/supabase-rest-client';

export interface Services {
  readonly config: ServerConfig;
  readonly auth: SupabaseAuthClient;
  readonly rest: SupabaseRestClient;
  readonly now: () => number;
}
