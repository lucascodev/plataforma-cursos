import { Link } from 'react-router';
import { Badge } from '@/shared/presentation/components/feedback/badge/badge';
import type { ProfileRole } from '../../../domain/types/profile-role.type';
import { describeRole } from '../../formatters/describe-role';
import styles from './profile-header.module.css';

interface ProfileHeaderProps {
  displayName: string;
  handle: string;
  avatarUrl: string | null;
  role: ProfileRole;
}

export function ProfileHeader({ displayName, handle, avatarUrl, role }: ProfileHeaderProps) {
  return (
    <header className={styles.header}>
      {avatarUrl ? (
        <img className={styles.avatar} src={avatarUrl} alt="" width={72} height={72} referrerPolicy="no-referrer" />
      ) : (
        <span className={styles.initial} aria-hidden="true">
          {displayName.slice(0, 1).toUpperCase()}
        </span>
      )}
      <div className={styles.identity}>
        <h1 className={styles.name}>{displayName}</h1>
        <p className={styles.meta}>
          <span className={styles.handle}>@{handle}</span>
          <Badge tone={role === 'student' ? 'neutral' : 'accent'}>{describeRole(role)}</Badge>
          {role === 'student' ? (
            <span>Seu perfil é privado.</span>
          ) : (
            <Link to={`/professores/${handle}`}>Ver página pública</Link>
          )}
        </p>
      </div>
    </header>
  );
}
