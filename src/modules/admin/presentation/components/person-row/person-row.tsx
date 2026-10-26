import { useState } from 'react';
import { Button } from '@/shared/presentation/components/actions/button/button';
import { Notice } from '@/shared/presentation/components/feedback/notice/notice';
import { readErrorMessage } from '@/shared/presentation/formatters/read-error-message';
import type { AdminPerson } from '../../../domain/entities/admin-person.entity';
import type { AdminRole } from '../../../domain/types/admin-role.type';
import { ROLE_LABELS } from '../../formatters/describe-role';
import { formatDateTime } from '../../formatters/format-date-time';
import { useSetRoleMutation } from '../../hooks/use-set-role-mutation/use-set-role-mutation';
import { PersonChip } from '../person-chip/person-chip';
import styles from './person-row.module.css';

const ROLES = Object.keys(ROLE_LABELS) as AdminRole[];
const isRole = (value: string): value is AdminRole => (ROLES as string[]).includes(value);

export function PersonRow({ person }: { person: AdminPerson }) {
  const setRole = useSetRoleMutation();
  const [role, setRoleDraft] = useState<AdminRole>(person.role);

  return (
    <li className={styles.row}>
      <div className={styles.identity}>
        <PersonChip person={person} />
        <span className={styles.meta}>
          desde {formatDateTime(person.createdAt)} · {person.coursesOwned === 1 ? '1 curso' : `${person.coursesOwned} cursos`}
        </span>
      </div>
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
      </div>
      {setRole.isError ? <Notice tone="warning">{readErrorMessage(setRole.error, 'Não foi possível mudar o papel agora.')}</Notice> : null}
    </li>
  );
}
