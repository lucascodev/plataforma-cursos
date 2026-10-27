export interface LabRepository {
  /** Resolves to true when the completion code matches the one the teacher registered. */
  verifyCode(courseSlug: string, itemKey: string, code: string): Promise<boolean>;
}
