import type { z } from 'zod';

// Portuguese text for the schema's built-in messages. Messages written in the schema itself take precedence over this.
export function courseIssueMessage(issue: z.core.$ZodRawIssue): string {
  switch (issue.code) {
    case 'too_small':
      if (issue.origin === 'array') return issue.minimum === 1 ? 'Adicione pelo menos um item.' : `Adicione pelo menos ${issue.minimum} itens.`;
      if (issue.origin === 'string') return 'Preencha este campo.';
      return `Use um valor a partir de ${issue.minimum}.`;
    case 'too_big':
      if (issue.origin === 'array') return `Use no máximo ${issue.maximum} itens.`;
      if (issue.origin === 'string') return `Use até ${issue.maximum} letras.`;
      return `Use um valor até ${issue.maximum}.`;
    case 'invalid_type':
      return 'Preencha este campo.';
    case 'invalid_format':
      return issue.format === 'url' ? 'Use um link completo, começando com https://.' : 'Formato inválido.';
    case 'invalid_value':
      return 'Escolha uma das opções.';
    default:
      return 'Valor inválido.';
  }
}
