import { useState } from 'react';
import { useAuthSession } from '@/modules/auth';
import { Button } from '@/shared/presentation/components/actions/button/button';
import { Badge } from '@/shared/presentation/components/feedback/badge/badge';
import { Notice } from '@/shared/presentation/components/feedback/notice/notice';
import { readErrorMessage } from '@/shared/presentation/formatters/read-error-message';
import type { AdminPerson } from '../../../domain/entities/people/admin-person.entity';
import type { AdminRole } from '../../../domain/types/admin-role.type';
import { ROLE_LABELS } from '../../formatters/describe-role';
import { formatDateTime } from '../../formatters/format-date-time';
import { useSetRoleMutation } from '../../hooks/use-set-role-mutation/use-set-role-mutation';
import { PersonChip } from '../person-chip/person-chip';
import { AccountDialog } from './components/account-dialog/account-dialog';
import styles from './person-row.module.css';

const ROLES = Object.keys(ROLE_LABELS) as AdminRole[];
const isRole = (value: string): value is AdminRole => (ROLES as string[]).includes(value);

export function PersonRow({ person }: { readonly person: AdminPerson }) {
  const session = useAuthSession();
  const setRole = useSetRoleMutation();
  const [role, setRoleDraft] = useState<AdminRole>(person.role);
  const [isManaging, setManaging] = useState(false);
  const isSelf = session.user?.id === person.id;

  return (
    <li className={styles.row}>
      <div className={styles.identity}>
        <span className={styles.name}>
          <PersonChip person={person} />
          {person.blockedAt ? <Badge tone="danger">Bloqueada</Badge> : null}
        </span>
        <span className={styles.meta}>
          desde {formatDateTime(person.createdAt)} · último acesso {person.lastSignInAt ? formatDateTime(person.lastSignInAt) : 'nunca'} · estuda{' '}
          {person.coursesStudying === 1 ? '1 curso' : `${person.coursesStudying} cursos`}
          {person.coursesOwned > 0 ? ` · ensina ${person.coursesOwned === 1 ? '1 curso' : `${person.coursesOwned} cursos`}` : ''}
        </span>
      </div>
      {isSelf ? (
        <span className={styles.meta}>Você não muda o próprio papel. Peça a outra pessoa admin.</span>
      ) : (
        <div className={styles.controls}>
          <select
            className={styles.select}
            aria-label={`Papel de ${person.displayName}`}
            value={role}
            onChange={(event) => {
              if (isRole(event.target.value)) setRoleDraft(event.target.value);
            }}
          >
            {ROLES.map((option) => (
              <option key={option} value={option}>
                {ROLE_LABELS[option]}
              </option>
            ))}
          </select>
          <Button disabled={role === person.role || setRole.isPending} onClick={() => setRole.mutate({ personId: person.id, role })}>
            Salvar papel
          </Button>
          <Button onClick={() => setManaging(true)}>Conta</Button>
        </div>
      )}
      {setRole.isError ? <Notice tone="warning">{readErrorMessage(setRole.error, 'Não foi possível mudar o papel agora.')}</Notice> : null}
      {isSelf ? null : <AccountDialog key={`${person.id}:${person.blockedAt ?? ''}`} person={person} open={isManaging} onClose={() => setManaging(false)} />}
    </li>
  );
}
