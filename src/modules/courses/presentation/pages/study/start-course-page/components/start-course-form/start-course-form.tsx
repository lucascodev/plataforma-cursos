import { Link } from 'react-router';
import { useCourseProgress } from '@/modules/progress';
import { Button } from '@/shared/presentation/components/actions/button/button';
import { Banner } from '@/shared/presentation/components/feedback/banner/banner';
import { PageStatus } from '@/shared/presentation/components/feedback/page-status/page-status';
import { CheckboxField } from '@/shared/presentation/components/form/checkbox-field/checkbox-field';
import { RadioCard } from '@/shared/presentation/components/form/radio-card/radio-card';
import { Stepper } from '@/shared/presentation/components/navigation/stepper/stepper';
import type { CourseDetailsOutputDto } from '../../../../../../application/dtos/get-course-by-slug/course-details-output.dto';
import { useStartCourse } from '../../../../../hooks/use-start-course/use-start-course';
import styles from './start-course-form.module.css';

export function StartCourseForm({ details }: { readonly details: CourseDetailsOutputDto }) {
  const progressState = useCourseProgress(details.course.slug);
  const form = useStartCourse(details, progressState);

  if (progressState.status === 'loading') return <PageStatus title="Carregando seu progresso…" />;

  return (
    <div className={styles.page}>
      <title>{`Começar · ${details.course.title}`}</title>
      <div className={styles.top}>
        <div>
          <p className={styles.kicker}>{details.course.title}</p>
          <h1 className={styles.title}>Vamos montar o seu plano</h1>
        </div>
        <Link to={form.coursePath}>Cancelar</Link>
      </div>
      <Stepper label="Etapas" steps={form.stepLabels} current={form.step - 1} />

      {form.existingStartLabel ? (
        <Banner tone="warning">
          <p>Você já tem um plano começando em {form.existingStartLabel}. Escolher outra data refaz o plano; os itens concluídos, as anotações e o diário continuam.</p>
        </Banner>
      ) : null}

      {form.step === 1 ? (
        <section className={styles.step} aria-labelledby="etapa-data">
          <div>
            <h2 id="etapa-data" className={styles.stepTitle}>
              Quando você começa?
            </h2>
            <p className={styles.stepLead}>O plano distribui as aulas a partir desta data. Dá para mudar depois.</p>
          </div>
          <div className={styles.options} role="radiogroup" aria-label="Data de início">
            {form.options.map((option) => (
              <RadioCard key={option.value} name="inicio" value={option.value} checked={form.choice === option.value} title={option.title} description={option.description} onSelect={form.choose} />
            ))}
          </div>
          {form.choice === 'custom' ? (
            <label className={styles.dateField}>
              Data de início
              <input type="date" value={form.customDate} required onChange={(event) => form.setCustomDate(event.target.value)} />
            </label>
          ) : null}
          <p className={styles.summary} aria-live="polite">
            <strong>{form.summary.studyDays}</strong>
            <span>{form.summary.range}</span>
          </p>
          <div className={styles.actions}>
            <Button tone="primary" size="lg" onClick={form.next}>
              Continuar
            </Button>
          </div>
        </section>
      ) : (
        <section className={styles.step} aria-labelledby="etapa-ritmo">
          <div>
            <h2 id="etapa-ritmo" className={styles.stepTitle}>
              Reserve estes horários na agenda
            </h2>
            <p className={styles.stepLead}>O curso foi pensado para {form.weeklyHours} por semana. Constância rende mais que maratona.</p>
          </div>
          <ul className={styles.rhythm}>
            {form.rhythmItems.map((item) => (
              <li key={item.when}>
                <span className={styles.hours}>{item.hours}</span>
                <span className={styles.when}>{item.when}</span>
                <span className={styles.what}>{item.what}</span>
              </li>
            ))}
          </ul>
          <CheckboxField checked={form.wantsCalendar} onChange={(event) => form.setWantsCalendar(event.target.checked)}>
            Baixar os horários como evento recorrente (.ics) para a minha agenda
          </CheckboxField>
          <div className={styles.actions}>
            <Button size="lg" onClick={form.back}>
              Voltar
            </Button>
            <Button tone="primary" size="lg" onClick={form.start}>
              Começar o curso
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}
