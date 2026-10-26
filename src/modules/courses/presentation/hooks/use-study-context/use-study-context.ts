import { useOutletContext } from 'react-router';
import type { StudyContext } from '../../types/study/study-context.type';

export function useStudyContext(): StudyContext {
  return useOutletContext<StudyContext>();
}
