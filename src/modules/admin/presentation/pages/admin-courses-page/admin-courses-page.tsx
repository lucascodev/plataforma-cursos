import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { Button } from '@/shared/presentation/components/actions/button/button';
import { PageStatus } from '@/shared/presentation/components/feedback/page-status/page-status';
import { TextField } from '@/shared/presentation/components/form/text-field/text-field';
import type { AdminCourseStatus } from '../../../domain/types/admin-course-status.type';
import { CourseRow } from '../../components/course-row/course-row';
import { FilterChips } from '../../components/filter-chips/filter-chips';
import { useAdminCoursesQuery } from '../../hooks/use-admin-courses-query/use-admin-courses-query';
import styles from '../../styles/admin-page.module.css';

const STATUSES: readonly { readonly value: AdminCourseStatus | null; readonly label: string }[] = [
  { value: null, label: 'Todos' },
  { value: 'review', label: 'Esperando revisão' },
  { value: 'published', label: 'No catálogo' },
  { value: 'unlisted', label: 'Fora do catálogo' },
  { value: 'draft', label: 'Nunca publicados' },
];
const readStatus = (value: string | null): AdminCourseStatus | null => STATUSES.find((status) => status.value === value)?.value ?? null;

export function AdminCoursesPage() {
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  const status = readStatus(params.get('situacao'));
  const [search, setSearch] = useState(query);
  const courses = useAdminCoursesQuery(query, status);
  const update = (next: { q?: string | null; situacao?: string | null }) => {
    const merged = new URLSearchParams(params);
    for (const [key, value] of Object.entries(next)) {
      if (value) merged.set(key, value);
      else merged.delete(key);
    }
    setParams(merged);
  };

  return (
    <>
      <title>Cursos</title>
      <h1 className={styles.title}>Cursos</h1>
      <p className={styles.lead}>
        Cursos novos nascem de propostas aprovadas e cada versão passa por revisão antes de ir ao ar. Um curso com estudantes não é excluído: tire do
        catálogo e ele continua abrindo para quem já estuda.
      </p>
      <form
        className={styles.toolbar}
        onSubmit={(event) => {
          event.preventDefault();
          update({ q: search.trim() || null });
        }}
      >
        <TextField label="Buscar curso ou professor" value={search} maxLength={80} onChange={(event) => setSearch(event.target.value)} />
        <Button type="submit">Buscar</Button>
      </form>
      <FilterChips label="Situação" options={STATUSES} selected={status} onSelect={(value) => update({ situacao: value })} />
      {courses.isPending ? (
        <PageStatus title="Carregando cursos…" />
      ) : courses.isError ? (
        <PageStatus title="Não foi possível carregar os cursos" />
      ) : courses.data.length === 0 ? (
        <p className={styles.muted}>Nenhum curso nesta situação.</p>
      ) : (
        <ul className={styles.list}>
          {courses.data.map((course) => (
            <CourseRow key={course.slug} course={course} />
          ))}
        </ul>
      )}
    </>
  );
}
