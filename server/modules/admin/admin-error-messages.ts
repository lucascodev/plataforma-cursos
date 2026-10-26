import type { ProblemMessages } from '../../shared/http/responses/problem-message.type';

export const ADMIN_ERROR_MESSAGES: ProblemMessages = {
  'proposal-not-found': [404, 'Proposta não encontrada.'],
  'proposal-not-pending': [409, 'Esta proposta já foi analisada.'],
  'slug-taken': [409, 'Esse endereço já é usado por outro curso.'],
  'invalid-slug': [422, 'Endereço inválido. Use letras minúsculas, números e hífens.'],
  'note-required': [422, 'Explique o motivo para quem propôs.'],
  'invalid-decision': [422, 'Decisão inválida.'],
  'invalid-role': [422, 'Papel inválido.'],
  'person-not-found': [404, 'Pessoa não encontrada.'],
  'course-not-found': [404, 'Curso não encontrado.'],
  'last-admin': [409, 'Precisa existir pelo menos uma pessoa admin.'],
  'owns-courses': [409, 'Essa pessoa é dona de cursos. Passe os cursos para outra pessoa antes.'],
  'course-has-students': [409, 'Este curso tem estudantes e não pode ser apagado. Tire do catálogo em vez disso.'],
};
