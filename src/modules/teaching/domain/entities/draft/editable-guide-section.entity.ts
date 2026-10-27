import type { EditableCourse } from './editable-course.entity';

export type EditableGuideSection = NonNullable<EditableCourse['guide']>['sections'][number];
