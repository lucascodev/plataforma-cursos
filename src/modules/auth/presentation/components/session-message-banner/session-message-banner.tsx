import { Banner } from '@/shared/presentation/components/feedback/banner/banner';
import { useAuthSession } from '../../hooks/use-auth-session/use-auth-session';
import styles from './session-message-banner.module.css';

export function SessionMessageBanner() {
  const session = useAuthSession();
  if (!session.errorMessage) return null;
  return (
    <div className={styles.wrapper}>
      <Banner tone="warning">
        <p>{session.errorMessage}</p>
      </Banner>
    </div>
  );
}
