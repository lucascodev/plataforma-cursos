import type { StudyNavIconName } from '../../types/study/study-nav-icon-name.type';

const PATHS: Readonly<Record<StudyNavIconName, string>> = {
  today: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v2M12 20v2M2 12h2M20 12h2',
  plan: 'M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zM3 10h18M8 3v4M16 3v4',
  modules: 'M4 6h16M4 12h16M4 18h10',
  projects: 'M4 7l8-4 8 4-8 4zM4 12l8 4 8-4M4 17l8 4 8-4',
  journal: 'M4 4h12a4 4 0 0 1 4 4v12H8a4 4 0 0 1-4-4z',
  data: 'M12 3v12M7 10l5 5 5-5M5 21h14',
};

export function StudyNavIcon({ name }: { readonly name: StudyNavIconName }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={PATHS[name]} />
    </svg>
  );
}
