import type { ProblemMessages } from '../../shared/http/responses/problem-message.type';

export const LAB_ERROR_MESSAGES: ProblemMessages = {
  'course-not-found': [404, 'Curso não encontrado.'],
  'lab-code-missing': [409, 'O professor ainda não registrou o código deste laboratório. Avise a equipe.'],
  'invalid-lab-code': [422, 'O código tem o formato LAB-XXXXXXXX.'],
  'invalid-lab-item': [422, 'Laboratório inválido.'],
};
