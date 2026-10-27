import type { TeacherCourse } from '../../domain/entities/teacher-course.entity';
import type { TeachingGateway } from '../ports/teaching-gateway.interface';

export class ListTeacherCoursesUseCase {
  constructor(private readonly teachingGateway: TeachingGateway) {}

  execute(): Promise<TeacherCourse[]> {
    return this.teachingGateway.listCourses();
  }
}
