import type { Course } from '../../domain/entities/course/course.entity';
import type { CourseContent } from '@contracts/course/course-content.schema';
import { defaultDrillId } from '@contracts/course/item-ids/default-drill-id';
import { defaultLessonId } from '@contracts/course/item-ids/default-lesson-id';

export function mapCourseContentToEntity(content: CourseContent): Course {
  return {
    slug: content.slug,
    title: content.title,
    tagline: content.tagline,
    description: content.description,
    level: content.level,
    audience: content.audience,
    version: content.version,
    updatedAt: content.updatedAt,
    rhythm: content.rhythm,
    kickoff: content.kickoff,
    sundayTrack: content.sundayTrack
      ? {
          moduleId: content.sundayTrack.moduleId,
          rotation: content.sundayTrack.rotation,
          milestones: content.sundayTrack.milestones.map((milestone) => ({
            sunday: milestone.sunday,
            title: milestone.title,
            detail: milestone.detail,
            lessonIndex: milestone.lessonIndex ?? null,
          })),
        }
      : null,
    modules: content.modules.map((module) => ({
      id: module.id,
      shortTitle: module.shortTitle,
      title: module.title,
      kind: module.kind,
      months: module.months,
      projectDays: module.projectDays ?? null,
      prerequisite: module.prerequisite,
      goal: module.goal,
      caseStudy: module.caseStudy,
      lowSpecTip: module.lowSpecTip ?? null,
      lessons: module.lessons.map((lesson, index) => ({ ...lesson, id: lesson.id ?? defaultLessonId(index) })),
      drills: module.drills.map((drill, index) => ({ ...drill, id: drill.id ?? defaultDrillId(index) })),
      project: module.project,
      selfCheck: module.selfCheck,
      resources: module.resources,
    })),
    guide: {
      architecture: content.guide?.architecture
        ? {
            title: content.guide.architecture.title,
            description: content.guide.architecture.description,
            rows: content.guide.architecture.rows.map((row) =>
              row.nodes.map((node) => ({ title: node.title, detail: node.detail, highlight: node.highlight ?? false })),
            ),
            bands: content.guide.architecture.bands,
          }
        : null,
      sections: (content.guide?.sections ?? []).map((section) => ({
        title: section.title,
        intro: section.intro ?? null,
        items: section.items,
        link: section.link ?? null,
      })),
    },
    author: null,
  };
}
