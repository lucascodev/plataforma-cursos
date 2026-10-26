import type { ProposalRecord } from '@contracts/proposal.schema';
import type { Proposal } from '../../domain/entities/proposal.entity';

export function mapProposalRecordToEntity(record: ProposalRecord): Proposal {
  return {
    id: record.id,
    status: record.status,
    title: record.title,
    summary: record.summary,
    audience: record.audience,
    area: record.area,
    language: record.language,
    outline: record.outline,
    experience: record.experience,
    sampleUrl: record.sampleUrl,
    suggestedSlug: record.suggestedSlug,
    reviewNote: record.reviewNote,
    reviewedAt: record.reviewedAt,
    courseSlug: record.courseSlug,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}
