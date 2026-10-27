import { Button } from '@/shared/presentation/components/actions/button/button';
import { Badge } from '@/shared/presentation/components/feedback/badge/badge';
import { Notice } from '@/shared/presentation/components/feedback/notice/notice';
import { TextAreaField } from '@/shared/presentation/components/form/text-area-field/text-area-field';
import type { AdminVersionDetail } from '../../../domain/entities/versions/admin-version-detail.entity';
import { describeVersionStatus } from '../../formatters/describe-version-status';
import { formatDateTime } from '../../formatters/format-date-time';
import { useVersionReview } from '../../hooks/use-version-review/use-version-review';
import pageStyles from '../../styles/admin-page.module.css';
import { Dialog } from '@/shared/presentation/components/overlay/dialog/dialog';
import { PersonChip } from '../person-chip/person-chip';
import { VersionImpact } from '../version-impact/version-impact';
import { VersionHistory } from '../version-history/version-history';
import styles from './version-review.module.css';

const MAX_LISTED_ERRORS = 10;

export function VersionReview({ detail }: { readonly detail: AdminVersionDetail }) {
  const { version, course } = detail;
  const review = useVersionReview(detail);

  return (
    <>
      <title>{`Revisão: ${course.title}`}</title>
      <h1 className={pageStyles.title}>
        {course.title} {version.semver ? `v${version.semver}` : ''}
      </h1>
      <p className={styles.meta}>
        <Badge tone={version.status === 'in_review' ? 'accent' : 'neutral'}>{describeVersionStatus(version.status)}</Badge>
        Dono: <PersonChip person={course.owner} />
        {version.submittedAt ? ` · enviada em ${formatDateTime(version.submittedAt)}` : ''}
        {` · ${course.studentCount === 1 ? '1 pessoa estudando' : `${course.studentCount} pessoas estudando`}`}
      </p>

      {version.submitMessage ? (
        <section className={styles.card} aria-labelledby="recado">
          <h2 id="recado" className={styles.heading}>
            Recado de quem enviou
          </h2>
          <p className={styles.text}>{version.submitMessage}</p>
        </section>
      ) : null}

      {version.reviewItems.length > 0 ? (
        <section className={styles.card} aria-labelledby="ajustes-pedidos">
          <h2 id="ajustes-pedidos" className={styles.heading}>
            Ajustes pedidos
          </h2>
          <ul className={styles.list}>
            {version.reviewItems.map((item) => (
              <li key={item.id}>
                {item.text} <Badge tone={item.resolved ? 'accent' : 'warning'}>{item.resolved ? 'feito' : 'pendente'}</Badge>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className={styles.card} aria-labelledby="mudancas">
        <h2 id="mudancas" className={styles.heading}>
          {detail.publishedContent ? 'O que muda em relação à versão publicada' : 'Primeira publicação'}
        </h2>
        {!detail.publishedContent ? <p className={styles.text}>Nada foi publicado ainda: o curso inteiro entra no ar com esta versão.</p> : null}
        {detail.publishedContent && review.diff.changes.length === 0 ? <p className={styles.text}>Nenhuma mudança de conteúdo.</p> : null}
        {detail.publishedContent ? (
          <ul className={styles.list}>
            {review.diff.changes.map((change) => (
              <li key={change.text}>{change.text}</li>
            ))}
          </ul>
        ) : null}
        {review.diff.removedItemKeys.length > 0 ? (
          <Notice tone="warning">
            {review.diff.removedItemKeys.length} {review.diff.removedItemKeys.length === 1 ? 'aula ou exercício publicado sai' : 'aulas ou exercícios publicados saem'}.
            Para quem já concluiu, esses itens deixam de contar no progresso.
          </Notice>
        ) : null}
      </section>

      {detail.publishedContent ? (
        <section className={styles.card} aria-labelledby="efeito">
          <h2 id="efeito" className={styles.heading}>
            Efeito em quem já estuda
          </h2>
          <VersionImpact versionId={version.id} />
        </section>
      ) : null}

      <section className={styles.card} aria-labelledby="checagem">
        <h2 id="checagem" className={styles.heading}>
          Checagem automática
        </h2>
        {review.errors.length === 0 ? (
          <p className={styles.text}>O conteúdo passa no schema do curso.</p>
        ) : (
          <>
            <Notice tone="danger">
              {review.errors.length} {review.errors.length === 1 ? 'erro impede' : 'erros impedem'} a publicação. Peça ajustes.
            </Notice>
            <ul className={styles.list}>
              {review.errors.slice(0, MAX_LISTED_ERRORS).map((check, index) => (
                <li key={`${check.where}-${index}`}>
                  <strong>{check.where}</strong>: {check.message}
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      {version.status === 'in_review' ? (
        <div className={styles.decisions}>
          <section className={styles.card} aria-labelledby="publicar">
            <h2 id="publicar" className={styles.heading}>
              Publicar
            </h2>
            <TextAreaField
              label="O que há de novo (aparece no histórico do curso)"
              rows={3}
              maxLength={2000}
              value={review.releaseNote}
              onChange={(event) => review.setReleaseNote(event.target.value)}
            />
            <div>
              <Button tone="primary" size="md" disabled={!review.canPublish || review.isBusy} onClick={review.askPublish}>
                Publicar versão {version.semver}
              </Button>
            </div>
          </section>
          <section className={styles.card} aria-labelledby="ajustes">
            <h2 id="ajustes" className={styles.heading}>
              Pedir ajustes
            </h2>
            <TextAreaField
              label="Pontos para ajustar, um por linha"
              hint="Cada linha vira um item que a pessoa marca como feito no editor."
              rows={4}
              value={review.changesText}
              onChange={(event) => review.setChangesText(event.target.value)}
            />
            <div>
              <Button size="md" disabled={!review.canRequestChanges || review.isBusy} onClick={review.requestChanges}>
                Pedir ajustes
              </Button>
            </div>
          </section>
        </div>
      ) : null}

      {review.canRestore ? (
        <div>
          <Button disabled={review.isBusy} onClick={review.restore}>
            Restaurar esta versão como rascunho
          </Button>
        </div>
      ) : null}
      {review.failureMessage ? <Notice tone="warning">{review.failureMessage}</Notice> : null}

      <VersionHistory slug={course.slug} currentId={version.id} />

      <Dialog
        open={review.isConfirmingPublish}
        title={`Publicar ${course.title} ${version.semver ?? ''}?`}
        description={
          detail.publishedContent
            ? 'A versão no ar fica guardada no histórico, de onde dá para restaurar. O plano de quem estuda é recalculado no próximo acesso.'
            : 'O curso entra no catálogo com esta versão.'
        }
        onClose={review.cancelPublish}
        actions={
          <>
            <Button size="md" onClick={review.cancelPublish}>
              Cancelar
            </Button>
            <Button size="md" tone="primary" isLoading={review.isBusy} onClick={review.publish}>
              Publicar agora
            </Button>
          </>
        }
      />
    </>
  );
}
