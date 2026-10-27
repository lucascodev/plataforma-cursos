import { useState } from 'react';
import { Link } from 'react-router';
import { Button } from '@/shared/presentation/components/actions/button/button';
import { Badge } from '@/shared/presentation/components/feedback/badge/badge';
import { Notice } from '@/shared/presentation/components/feedback/notice/notice';
import { readErrorMessage } from '@/shared/presentation/formatters/read-error-message';
import type { AdminCourse } from '../../../domain/entities/admin-course.entity';
import { useCourseListingMutation } from '../../hooks/use-course-listing-mutation/use-course-listing-mutation';
import { useCourseOwnerMutation } from '../../hooks/use-course-owner-mutation/use-course-owner-mutation';
import { describeVersionStatus } from '../../formatters/describe-version-status';
import { useDeleteCourseMutation } from '../../hooks/use-delete-course-mutation/use-delete-course-mutation';
import { PersonChip } from '../person-chip/person-chip';
import styles from './course-row.module.css';

function CourseState({ course }: { course: AdminCourse }) {
  if (!course.published) return <Badge>Rascunho</Badge>;
  return course.listed ? <Badge tone="accent">No catálogo</Badge> : <Badge tone="warning">Fora do catálogo</Badge>;
}

export function CourseRow({ course }: { course: AdminCourse }) {
  const listing = useCourseListingMutation();
  const owner = useCourseOwnerMutation();
  const remove = useDeleteCourseMutation();
  const [handle, setHandle] = useState('');
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const failure = listing.error ?? owner.error ?? remove.error;

  return (
    <li className={styles.row}>
      <div className={styles.head}>
        <div className={styles.identity}>
          {course.published ? (
            <Link className={styles.title} to={`/cursos/${course.slug}`}>
              {course.title}
            </Link>
          ) : (
            <span className={styles.title}>{course.title}</span>
          )}
          <span className={styles.slug}>/cursos/{course.slug}</span>
        </div>
        <CourseState course={course} />
      </div>
      <p className={styles.meta}>
        Dono: <PersonChip person={course.owner} /> · {course.studentCount === 1 ? '1 pessoa estudando' : `${course.studentCount} pessoas estudando`}
        {course.version ? ` · versão ${course.version}` : ''}
      </p>
      {course.openVersion ? (
        <p className={styles.meta}>
          {course.openVersion.semver ? `v${course.openVersion.semver}` : 'Rascunho'}: {describeVersionStatus(course.openVersion.status).toLowerCase()} ·{' '}
          <Link to={`/admin/versoes/${course.openVersion.id}`}>{course.openVersion.status === 'in_review' ? 'Revisar' : 'Ver versão'}</Link>
        </p>
      ) : null}
      <div className={styles.actions}>
        {course.published ? (
          <Button disabled={listing.isPending} onClick={() => listing.mutate({ slug: course.slug, listed: !course.listed })}>
            {course.listed ? 'Tirar do catálogo' : 'Voltar ao catálogo'}
          </Button>
        ) : null}
        <form
          className={styles.owner}
          onSubmit={(event) => {
            event.preventDefault();
            if (handle.trim()) owner.mutate({ slug: course.slug, handle }, { onSuccess: () => setHandle('') });
          }}
        >
          <input
            className={styles.input}
            aria-label={`Novo dono de ${course.title}`}
            placeholder="@endereco do perfil"
            value={handle}
            maxLength={40}
            onChange={(event) => setHandle(event.target.value)}
          />
          <Button type="submit" disabled={owner.isPending || !handle.trim()}>
            Trocar dono
          </Button>
        </form>
        {course.studentCount > 0 ? (
          <span className={styles.hint}>Com estudantes, o curso não pode ser apagado.</span>
        ) : confirmingDelete ? (
          <span className={styles.confirm}>
            Apagar de vez?
            <Button tone="danger" disabled={remove.isPending} onClick={() => remove.mutate(course.slug)}>
              Sim, apagar
            </Button>
            <Button onClick={() => setConfirmingDelete(false)}>Cancelar</Button>
          </span>
        ) : (
          <Button tone="danger" onClick={() => setConfirmingDelete(true)}>
            Apagar
          </Button>
        )}
      </div>
      {failure ? <Notice tone="warning">{readErrorMessage(failure, 'Não foi possível concluir agora.')}</Notice> : null}
    </li>
  );
}
