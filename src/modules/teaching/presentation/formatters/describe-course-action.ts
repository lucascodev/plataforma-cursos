import type { TeacherCourse } from '../../domain/entities/teacher-course.entity';

// The editor button says what the teacher will find there.
export function describeCourseAction(course: Pick<TeacherCourse, 'openVersion' | 'published'>): string {
  switch (course.openVersion?.status) {
    case 'draft':
      return course.published ? 'Editar rascunho' : 'Continuar escrevendo';
    case 'changes_requested':
      return 'Ver ajustes';
    case 'in_review':
      return 'Ver versão em revisão';
    default:
      return 'Começar nova versão';
  }
}
