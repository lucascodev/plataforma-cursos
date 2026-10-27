import type { ProblemMessages } from '../../shared/http/responses/problem-message.type';
import { VERSION_CONFLICT_MESSAGE } from './version-conflict-message';

export const TEACHING_ERROR_MESSAGES: ProblemMessages = {
  'course-not-found': [404, 'Curso não encontrado.'],
  'version-not-found': [404, 'Versão não encontrada.'],
  'version-conflict': [409, VERSION_CONFLICT_MESSAGE],
  'version-locked': [409, 'A versão está em revisão. Retire da revisão para editar de novo.'],
  'version-not-in-review': [409, 'Esta versão não está em revisão.'],
  'version-not-changes-requested': [409, 'Esta versão não tem ajustes pedidos.'],
  'review-items-open': [409, 'Marque todos os ajustes pedidos como feitos antes de reenviar.'],
  'review-item-not-found': [404, 'Ajuste não encontrado.'],
  'invalid-content': [422, 'O conteúdo do rascunho é inválido.'],
  'invalid-version-kind': [422, 'Escolha o tipo da versão.'],
  'invalid-lab-code': [422, 'O código tem o formato LAB-XXXXXXXX.'],
  'invalid-lab-item': [422, 'Laboratório inválido.'],
};
