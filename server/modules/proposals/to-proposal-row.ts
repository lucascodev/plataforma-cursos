import type { ProposalInputRecord } from '../../../contracts/proposal-input.schema';

export function toProposalRow(input: ProposalInputRecord): Record<string, unknown> {
  return {
    title: input.title,
    summary: input.summary,
    audience: input.audience,
    area: input.area,
    language: input.language,
    outline: input.outline,
    experience: input.experience,
    sample_url: input.sampleUrl,
    suggested_slug: input.suggestedSlug,
  };
}
