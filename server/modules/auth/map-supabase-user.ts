import type { SupabaseUser } from '../../shared/supabase/supabase-user.type';
import type { AuthUserRecord } from '../../../contracts/auth-user.schema';

const TRUSTED_AVATAR_ORIGIN = 'https://avatars.githubusercontent.com/';

function readText(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, 80) : null;
}

export function mapSupabaseUser(user: SupabaseUser): AuthUserRecord {
  const metadata = user.user_metadata ?? {};
  const avatar = readText(metadata.avatar_url);
  return {
    id: user.id,
    displayName: readText(metadata.full_name) ?? readText(metadata.user_name) ?? 'Pessoa estudante',
    avatarUrl: avatar?.startsWith(TRUSTED_AVATAR_ORIGIN) ? avatar : null,
  };
}
