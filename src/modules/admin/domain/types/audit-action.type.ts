export type AuditAction =
  | 'proposal.submitted'
  | 'proposal.approved'
  | 'proposal.changes_requested'
  | 'proposal.refused'
  | 'proposal.withdrawn'
  | 'role.changed'
  | 'course.owner_changed'
  | 'course.listed'
  | 'course.unlisted'
  | 'course.deleted';
