import type { ServerConfig } from './server-config.type';
import type { ServerEnv } from './server-env.type';
import { isServerOnlySupabaseKey } from './is-server-only-supabase-key';
import { ServerMisconfiguredError } from './server-misconfigured.error';

// The functions talk to Supabase as the signed-in person (RLS applies), so the secret key is refused on purpose.
export function readServerConfig(env: ServerEnv): ServerConfig {
  const rawUrl = env.SUPABASE_URL?.trim() ?? '';
  const publishableKey = env.SUPABASE_PUBLISHABLE_KEY?.trim() ?? '';
  if (!rawUrl || !publishableKey) throw new ServerMisconfiguredError('SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY missing');
  if (isServerOnlySupabaseKey(publishableKey)) throw new ServerMisconfiguredError('secret key used where the publishable key belongs');

  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new ServerMisconfiguredError('SUPABASE_URL is not a URL');
  }
  const isLocal = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
  if (url.protocol !== 'https:' && !isLocal) throw new ServerMisconfiguredError('SUPABASE_URL must use https');

  return { supabaseUrl: url.origin, publishableKey };
}
