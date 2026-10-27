import type { EditableCourse } from './editable-course.entity';

export type EditableModule = EditableCourse['modules'][number];
export type EditableLesson = EditableModule['lessons'][number];
export type EditableDrill = EditableModule['drills'][number];
export type EditableProject = EditableModule['project'];
export type EditableResource = EditableModule['resources'][number];
