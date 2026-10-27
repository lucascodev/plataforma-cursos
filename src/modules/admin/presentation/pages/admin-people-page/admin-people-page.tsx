import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { Button } from '@/shared/presentation/components/actions/button/button';
import { PageStatus } from '@/shared/presentation/components/feedback/page-status/page-status';
import { SelectField } from '@/shared/presentation/components/form/select-field/select-field';
import { TextField } from '@/shared/presentation/components/form/text-field/text-field';
import type { AdminRole } from '../../../domain/types/admin-role.type';
import type { PeopleFilter } from '../../../domain/types/people-filter.type';
import { PersonRow } from '../../components/person-row/person-row';
import { ROLE_LABELS } from '../../formatters/describe-role';
import { useAdminPeopleQuery } from '../../hooks/use-admin-people-query/use-admin-people-query';
import styles from '../../styles/admin-page.module.css';

const PAGE_SIZE = 50;
const ROLES = Object.keys(ROLE_LABELS) as AdminRole[];
const ROLE_OPTIONS = [{ value: '', label: 'Todos' }, ...ROLES.map((role) => ({ value: role, label: ROLE_LABELS[role] })), { value: 'blocked', label: 'Bloqueadas' }];
const FILTERS: readonly PeopleFilter[] = [...ROLES, 'blocked'];
const readRole = (value: string | null): PeopleFilter | null => FILTERS.find((filter) => filter === value) ?? null;

export function AdminPeoplePage() {
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  const role = readRole(params.get('role'));
  const page = Math.max(1, Number(params.get('pagina')) || 1);
  const [search, setSearch] = useState(query);
  const people = useAdminPeopleQuery(query, role, page);

  const update = (next: Record<string, string | null>) => {
    const merged = new URLSearchParams(params);
    for (const [key, value] of Object.entries(next)) {
      if (value) merged.set(key, value);
      else merged.delete(key);
    }
    setParams(merged);
  };

  return (
    <>
      <title>Pessoas e papéis</title>
      <h1 className={styles.title}>Pessoas e papéis</h1>
      <p className={styles.lead}>
        O papel decide o que cada pessoa pode fazer. A aprovação de uma proposta já torna a pessoa professora; aqui ficam os ajustes
        manuais e a conta (sessões, bloqueio, exclusão). E-mails, anotações e diário nunca aparecem nesta tela.
      </p>
      <form
        className={styles.toolbar}
        onSubmit={(event) => {
          event.preventDefault();
          update({ q: search.trim() || null, pagina: null });
        }}
      >
        <TextField label="Buscar por nome ou endereço" value={search} maxLength={80} onChange={(event) => setSearch(event.target.value)} />
        <SelectField label="Papel" options={ROLE_OPTIONS} value={role ?? ''} onChange={(event) => update({ role: event.target.value || null, pagina: null })} />
        <Button type="submit">Buscar</Button>
      </form>
      {people.isPending ? (
        <PageStatus title="Carregando pessoas…" />
      ) : people.isError ? (
        <PageStatus title="Não foi possível carregar as pessoas" />
      ) : people.data.items.length === 0 ? (
        <p className={styles.muted}>Ninguém encontrado.</p>
      ) : (
        <>
          <ul className={styles.list}>
            {people.data.items.map((person) => (
              <PersonRow key={`${person.id}:${person.role}:${person.blockedAt ?? ''}`} person={person} />
            ))}
          </ul>
          <div className={styles.pager}>
            <span>{people.data.total === 1 ? '1 pessoa' : `${people.data.total} pessoas`}</span>
            {page > 1 ? <Button onClick={() => update({ pagina: String(page - 1) })}>Anteriores</Button> : null}
            {page * PAGE_SIZE < people.data.total ? <Button onClick={() => update({ pagina: String(page + 1) })}>Próximas</Button> : null}
          </div>
        </>
      )}
    </>
  );
}
