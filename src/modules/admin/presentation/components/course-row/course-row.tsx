import { Link } from 'react-router';
import { Button } from '@/shared/presentation/components/actions/button/button';
import { Badge } from '@/shared/presentation/components/feedback/badge/badge';
import { Notice } from '@/shared/presentation/components/feedback/notice/notice';
import { TypedConfirmDialog } from '@/shared/presentation/components/overlay/typed-confirm-dialog/typed-confirm-dialog';
import type { AdminCourse } from '../../../domain/entities/admin-course.entity';
import { describeVersionStatus } from '../../formatters/describe-version-status';
import { formatDateTime } from '../../formatters/format-date-time';
import { useCourseRowActions } from '../../hooks/use-course-row-actions/use-course-row-actions';
import { PersonChip } from '../person-chip/person-chip';
import { TransferDialog } from './components/transfer-dialog/transfer-dialog';
import { UnlistDialog } from './components/unlist-dialog/unlist-dialog';
import styles from './course-row.module.css';

function CourseState({ course }: { readonly course: AdminCourse }) {
  if (!course.published) return <Badge>Nunca publicado</Badge>;
  return course.listed ? <Badge tone="accent">No catálogo</Badge> : <Badge tone="warning">Fora do catálogo</Badge>;
}

export function CourseRow({ course }: { readonly course: AdminCourse }) {
  const actions = useCourseRowActions(course);
  const people = course.studentCount === 1 ? '1 pessoa estudando' : `${course.studentCount} pessoas estudando`;

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
        Professor: <PersonChip person={course.owner} /> · {people} · {course.active7d} ativas na semana
        {course.version ? ` · versão ${course.version}` : ''} · atualizado em {formatDateTime(course.updatedAt)}
      </p>
      {course.openVersion ? (
        <p className={styles.meta}>
          {course.openVersion.semver ? `v${course.openVersion.semver}` : 'Rascunho'}: {describeVersionStatus(course.openVersion.status).toLowerCase()} ·{' '}
          <Link to={`/admin/versoes/${course.openVersion.id}`}>{course.openVersion.status === 'in_review' ? 'Revisar' : 'Ver versão'}</Link>
        </p>
      ) : null}
      {course.unlistedNote ? <p className={styles.meta}>Nota: {course.unlistedNote}</p> : null}
      <div className={styles.actions}>
        {course.published && course.listed ? <Button onClick={() => actions.open('unlist')}>Tirar do catálogo</Button> : null}
        {course.published && !course.listed ? (
          <Button disabled={actions.isBusy} onClick={actions.relist}>
            Voltar ao catálogo
          </Button>
        ) : null}
        <Button onClick={() => actions.open('transfer')}>Transferir</Button>
        {course.studentCount > 0 ? (
          <span className={styles.hint}>Com estudantes, o curso não pode ser excluído.</span>
        ) : (
          <Button tone="danger" onClick={() => actions.open('delete')}>
            Excluir
          </Button>
        )}
      </div>
      {actions.dialog === null && actions.error ? <Notice tone="warning">{actions.error}</Notice> : null}

      <UnlistDialog
        open={actions.dialog === 'unlist'}
        title={course.title}
        isBusy={actions.isBusy}
        error={actions.error}
        onConfirm={actions.unlist}
        onClose={actions.close}
      />
      <TransferDialog
        open={actions.dialog === 'transfer'}
        title={course.title}
        isBusy={actions.isBusy}
        error={actions.error}
        onConfirm={actions.transfer}
        onClose={actions.close}
      />
      <TypedConfirmDialog
        open={actions.dialog === 'delete'}
        title={`Excluir "${course.title}"?`}
        description="O curso, todas as versões e o rascunho são apagados. Não dá para desfazer."
        phrase={course.slug}
        confirmLabel="Excluir definitivamente"
        isLoading={actions.isBusy}
        onConfirm={actions.remove}
        onClose={actions.close}
      />
    </li>
  );
}
