import { useQueryClient } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { makeDeleteAccount } from '../../../main/factories/make-delete-account.factory';
import { makeSignInWithGitHub } from '../../../main/factories/make-sign-in-with-github.factory';
import { makeSignOutEverywhere } from '../../../main/factories/make-sign-out-everywhere.factory';
import { makeSignOut } from '../../../main/factories/make-sign-out.factory';
import { AuthSessionContext } from '../../contexts/auth-session-context';
import { useCurrentUserQuery } from '../../hooks/use-current-user-query/use-current-user-query';
import { useSessionExpiryWatcher } from '../../hooks/use-session-expiry-watcher/use-session-expiry-watcher';
import { authQueryKeys } from '../../query-keys/auth-query-keys';
import type { AuthSession } from '../../types/auth-session.type';

const MESSAGES = {
  checkFailed: 'Não foi possível verificar sua sessão agora. Recarregue a página em instantes.',
  expired: 'Sua sessão terminou. Entre de novo para continuar salvando.',
  signOutFailed: 'Não foi possível sair agora. Tente de novo em instantes.',
} as const;

export function AuthSessionProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const currentUser = useCurrentUserQuery();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const reportSessionExpired = () => {
    if (queryClient.getQueryData(authQueryKeys.currentUser()) === null) return;
    queryClient.setQueryData(authQueryKeys.currentUser(), null);
    setErrorMessage(MESSAGES.expired);
  };
  useSessionExpiryWatcher(reportSessionExpired);

  // clear() would also drop the current-user query the header listens to, and the screen kept showing the person until
  // a reload. The session query gets null instead, and every other cached answer goes away.
  const forgetSession = () => {
    queryClient.setQueryData(authQueryKeys.currentUser(), null);
    queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== authQueryKeys.all[0] });
  };

  const user = currentUser.data ?? null;
  const session: AuthSession = {
    status: currentUser.isPending ? 'loading' : user ? 'signed-in' : 'signed-out',
    user,
    errorMessage: errorMessage ?? (currentUser.isError ? MESSAGES.checkFailed : null),
    reportSessionExpired,
    refresh() {
      void queryClient.invalidateQueries({ queryKey: authQueryKeys.currentUser() });
    },
    signIn(returnPath) {
      setErrorMessage(null);
      makeSignInWithGitHub().execute({ returnPath });
    },
    async signOut() {
      setErrorMessage(null);
      try {
        await makeSignOut().execute();
        forgetSession();
      } catch {
        setErrorMessage(MESSAGES.signOutFailed);
      }
    },
    async signOutEverywhere() {
      setErrorMessage(null);
      try {
        await makeSignOutEverywhere().execute();
        forgetSession();
      } catch {
        setErrorMessage(MESSAGES.signOutFailed);
      }
    },
    async deleteAccount() {
      setErrorMessage(null);
      await makeDeleteAccount().execute();
      forgetSession();
    },
  };

  return <AuthSessionContext value={session}>{children}</AuthSessionContext>;
}
