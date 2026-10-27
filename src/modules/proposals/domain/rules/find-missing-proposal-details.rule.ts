import type { ProposalDraft } from '../entities/proposal-draft.entity';

export type ProposalDetailField = 'level' | 'duration' | 'commitmentsAccepted';

// The API still accepts proposals without these fields (tabs running older code); the form always asks for them.
export function findMissingProposalDetails(draft: ProposalDraft): Partial<Record<ProposalDetailField, string>> {
  return {
    ...(draft.level ? {} : { level: 'Escolha o nível.' }),
    ...(draft.duration ? {} : { duration: 'Escolha a duração estimada.' }),
    ...(draft.commitmentsAccepted ? {} : { commitmentsAccepted: 'Aceite os compromissos para enviar.' }),
  };
}
