import styles from './proposal-flow.module.css';

const STEPS = [
  { title: 'Você propõe', detail: 'Título, público e os módulos previstos. Leva poucos minutos.' },
  { title: 'A equipe analisa', detail: 'Pode aprovar, pedir ajustes ou recusar, sempre com um motivo.' },
  { title: 'Você monta o curso', detail: 'Aprovada a proposta, você vira professor e recebe um rascunho do curso.' },
  { title: 'Revisão e publicação', detail: 'Cada versão passa por revisão antes de aparecer no catálogo.' },
] as const;

export function ProposalFlow() {
  return (
    <ol className={styles.flow}>
      {STEPS.map((step, index) => (
        <li key={step.title} className={styles.step}>
          <span className={styles.number}>{index + 1}</span>
          <span className={styles.title}>{step.title}</span>
          <span className={styles.detail}>{step.detail}</span>
        </li>
      ))}
    </ol>
  );
}
