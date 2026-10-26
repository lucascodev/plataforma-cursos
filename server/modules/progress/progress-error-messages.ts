import type { ProblemMessages } from '../../shared/http/responses/problem-message.type';

export const PROGRESS_ERROR_MESSAGES: ProblemMessages = {
  'progress-conflict': [409, 'Seu progresso mudou em outra aba ou aparelho. Juntando as mudanças.'],
  'invalid-progress': [422, 'Dados de progresso inválidos.'],
};
