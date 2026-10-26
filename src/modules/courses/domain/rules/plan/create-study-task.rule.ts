import type { StudyTask } from '../../entities/plan/study-task.entity';

type StudyTaskInput = Pick<StudyTask, 'kind'> & Partial<Omit<StudyTask, 'kind'>>;

export function createStudyTask(input: StudyTaskInput): StudyTask {
  return {
    moduleIndex: null,
    lessonIndex: null,
    drillIndex: null,
    part: 1,
    parts: 1,
    requirementIndex: null,
    sundayIndex: null,
    trackEntryIndex: null,
    itemId: null,
    ...input,
  };
}
