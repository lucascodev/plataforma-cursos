import { useContext } from 'react';
import { AuthSessionContext } from '../../contexts/auth-session-context';
import type { AuthSession } from '../../types/auth-session.type';

export function useAuthSession(): AuthSession {
  const session = useContext(AuthSessionContext);
  if (!session) throw new Error('useAuthSession must be used inside AuthSessionProvider');
  return session;
}
