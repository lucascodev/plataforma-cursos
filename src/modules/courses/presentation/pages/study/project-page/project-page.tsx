import { Link, Navigate, useParams } from 'react-router';
import { Button } from '@/shared/presentation/components/actions/button/button';
import { Banner } from '@/shared/presentation/components/feedback/banner/banner';
import { CheckboxField } from '@/shared/presentation/components/form/checkbox-field/checkbox-field';
import { TextAreaField } from '@/shared/presentation/components/form/text-area-field/text-area-field';
import { TextField } from '@/shared/presentation/components/form/text-field/text-field';
import { Dialog } from '@/shared/presentation/components/overlay/dialog/dialog';
import { CodeBlock } from '@/shared/presentation/components/data/code-block/code-block';
import { useProjectPage } from '../../../hooks/use-project-page/use-project-page';
import { useStudyContext } from '../../../hooks/use-study-context/use-study-context';
import styles from './project-page.module.css';

export function ProjectPage() {
  const { moduleId = '' } = useParams();
  const context = useStudyContext();
  const page = useProjectPage(context, moduleId);
  const { module, form } = page;

  if (!module) return <Navigate to={page.fallbackPath} replace />;

  return (
    <div className={styles.page}>
      <title>{`${module.project.title} · ${context.details.course.title}`}</title>

      <section className={styles.strip} aria-labelledby="seus-projetos">
        <div className={styles.stripHeading}>
          <h2 id="seus-projetos">Seus projetos</h2>
          <span>{page.portfolio}</span>
        </div>
        <ol className={styles.stripList}>
          {page.strip.map((entry) => (
            <li key={entry.id}>
              <Link
                to={entry.to}
                className={[styles.stripItem, entry.isActive ? styles.active : '', entry.isDelivered ? styles.delivered : ''].filter(Boolean).join(' ')}
                aria-current={entry.isActive ? 'page' : undefined}
              >
                <span className={styles.stripStatus}>
                  {entry.code} · {entry.status}
                </span>
                <span>{entry.title}</span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <header className={styles.header}>
        <p className={styles.kicker}>{page.kicker}</p>
        <h1 className={styles.title}>{module.project.title}</h1>
        <p className={styles.brief}>{module.project.brief}</p>
      </header>

      {page.stages.length > 0 ? (
        <ol className={styles.stages} aria-label="Etapas do projeto">
          {page.stages.map((stage) => (
            <li key={stage.kind} className={styles.stage}>
              <span className={styles.stageWhen}>{stage.when}</span>
              <span className={styles.stageTitle}>{stage.title}</span>
              <span className={styles.stageHint}>{stage.hint}</span>
            </li>
          ))}
        </ol>
      ) : null}

      <div className={styles.columns}>
        <div className={styles.lists}>
          <section className={styles.card} aria-labelledby="requisitos">
            <div className={styles.cardHeading}>
              <h2 id="requisitos">Requisitos</h2>
              <span>{page.requirementsCount}</span>
            </div>
            <ul className={styles.checks}>
              {page.requirements.map((item) => (
                <li key={item.id}>
                  <CheckboxField checked={item.checked} onChange={(event) => page.toggleCheck('requirements', item.id, event.target.checked)}>
                    {item.text}
                  </CheckboxField>
                </li>
              ))}
            </ul>
          </section>
          <section className={styles.card} aria-labelledby="pronto">
            <div className={styles.cardHeading}>
              <h2 id="pronto">Pronto quando</h2>
              <span>{page.criteriaCount}</span>
            </div>
            <ul className={styles.checks}>
              {page.criteria.map((item) => (
                <li key={item.id}>
                  <CheckboxField checked={item.checked} onChange={(event) => page.toggleCheck('criteria', item.id, event.target.checked)}>
                    {item.text}
                  </CheckboxField>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className={styles.delivery} aria-labelledby="entrega">
          <h2 id="entrega">Entrega</h2>
          {page.delivery ? (
            <Banner tone="accent" title={`Entregue em ${page.delivery.deliveredOn}`}>
              <p>Você pode atualizar os links e os números quando quiser.</p>
            </Banner>
          ) : null}
          <TextField
            label="Repositório público (obrigatório)"
            type="url"
            inputMode="url"
            placeholder="https://github.com/…"
            value={form.repoUrl}
            error={form.repoError}
            onChange={(event) => form.setRepoUrl(event.target.value)}
            onBlur={form.touchRepo}
          />
          <TextField
            label="Vídeo ou demonstração (opcional)"
            type="url"
            inputMode="url"
            placeholder="https://"
            value={form.demoUrl}
            error={form.demoError}
            onChange={(event) => form.setDemoUrl(event.target.value)}
          />
          <TextAreaField label="Números do projeto" hint="Métricas, tempo, custo: o que mostra que funciona." value={form.metrics} maxLength={1000} onChange={(event) => form.setMetrics(event.target.value)} />
          {page.deliverHint ? <p className={styles.hint}>{page.deliverHint}</p> : null}
          <Button tone="primary" size="lg" disabled={!page.canDeliver} onClick={page.deliver}>
            {page.delivery ? 'Atualizar entrega' : 'Marcar projeto como entregue'}
          </Button>
        </aside>
      </div>

      <Dialog
        open={page.celebration.isOpen}
        title={page.celebration.title}
        description={<p>{page.celebration.count}. O projeto entrou no seu portfólio.</p>}
        onClose={page.celebration.close}
        actions={
          <>
            <Button size="md" onClick={page.celebration.close}>
              Fechar
            </Button>
            <Link className={styles.dialogLink} to={page.modulePath}>
              Ir para o módulo
            </Link>
          </>
        }
      >
        <CodeBlock code={form.repoUrl} label="Link do repositório" />
      </Dialog>
    </div>
  );
}
