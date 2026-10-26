import type { ProblemMessages } from '../../shared/http/responses/problem-message.type';

export const PROPOSAL_ERROR_MESSAGES: ProblemMessages = {
  'proposal-not-found': [404, 'Proposta não encontrada.'],
  'proposal-not-open': [409, 'Esta proposta já foi encerrada.'],
  'too-many-open-proposals': [409, 'Você já tem 3 propostas abertas. Espere a análise de uma delas.'],
  'too-many-proposals': [409, 'Você chegou ao limite de 20 propostas.'],
};
