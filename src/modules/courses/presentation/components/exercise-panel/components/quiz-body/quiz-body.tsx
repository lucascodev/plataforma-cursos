import { Button } from '@/shared/presentation/components/actions/button/button';
import type { ExerciseView } from '../../../../types/exercise/exercise-view.type';
import styles from '../../../../styles/exercise.module.css';

type Quiz = Extract<ExerciseView['exercise'], { type: 'quiz' }>;

export function QuizBody({ exercise, view }: { readonly exercise: Quiz; readonly view: ExerciseView }) {
  const isChecked = view.state.attempts > 0;
  const score = view.quizScore;
  return (
    <section className={styles.section} aria-labelledby="perguntas">
      <h3 id="perguntas" className={styles.heading}>
        Perguntas <span className={styles.count}>{score ? `${score.answered} de ${score.total} respondidas` : ''}</span>
      </h3>
      <ol className={styles.list}>
        {exercise.questions.map((question) => {
          const chosen = view.state.answers[question.id];
          return (
            <li key={question.id} className={styles.item}>
              <fieldset className={styles.section}>
                <legend>
                  <strong>{question.text}</strong>
                </legend>
                {question.options.map((option) => {
                  const isChosen = chosen === option.id;
                  const verdict = isChecked && isChosen ? (option.id === question.correct ? styles.right : styles.wrong) : '';
                  return (
                    <label key={option.id} className={`${styles.option} ${verdict}`}>
                      <input type="radio" name={question.id} checked={isChosen} onChange={() => view.answer(question.id, option.id)} />
                      {option.text}
                    </label>
                  );
                })}
                {isChecked && chosen && question.explanation ? <p className={styles.explanation}>{question.explanation}</p> : null}
              </fieldset>
            </li>
          );
        })}
      </ol>
      <div className={styles.actions}>
        <Button tone="primary" disabled={!score || score.answered === 0} onClick={view.checkQuiz}>
          {isChecked ? 'Conferir de novo' : 'Conferir respostas'}
        </Button>
        {isChecked && score ? (
          <span role="status" className={score.passed ? styles.passed : styles.failed}>
            {score.correct} de {score.total} certas{score.passed ? '. Passou!' : `. Precisa de ${score.needed}.`}
          </span>
        ) : null}
      </div>
    </section>
  );
}
