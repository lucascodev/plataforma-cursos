import { BookOpen, CalendarDays, Database, Layers, NotebookPen, Sun, type LucideIcon } from 'lucide-react';
import type { StudyNavIconName } from '../../types/study/study-nav-icon-name.type';

const ICONS: Readonly<Record<StudyNavIconName, LucideIcon>> = {
  today: Sun,
  plan: CalendarDays,
  modules: BookOpen,
  projects: Layers,
  journal: NotebookPen,
  data: Database,
};

export function StudyNavIcon({ name }: { readonly name: StudyNavIconName }) {
  const Icon = ICONS[name];
  return <Icon size={20} aria-hidden="true" />;
}
