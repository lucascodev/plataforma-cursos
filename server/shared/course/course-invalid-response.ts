import type { CourseCheck } from '../../../contracts/course/checks/course-check.type';
import { jsonResponse } from '../http/responses/json-response';

const MAX_LISTED_ERRORS = 50;

// The same checks the editor shows, so the person sees exactly what to fix.
export function courseInvalidResponse(errors: readonly CourseCheck[]): Response {
  return jsonResponse(
    {
      error: {
        code: 'course-invalid',
        message: `O curso tem ${errors.length} ${errors.length === 1 ? 'erro' : 'erros'} para corrigir antes de seguir.`,
        checks: errors.slice(0, MAX_LISTED_ERRORS),
      },
    },
    422,
  );
}
