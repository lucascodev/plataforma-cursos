import { useState } from 'react';
import { Button } from '@/shared/presentation/components/actions/button/button';
import { EmptyState } from '@/shared/presentation/components/feedback/empty-state/empty-state';
import { Dialog } from '@/shared/presentation/components/overlay/dialog/dialog';
import type { EditableCourse } from '../../../domain/entities/draft/editable-course.entity';
import type { EditableModule } from '../../../domain/entities/draft/editable-module.entity';
import { createItemId } from '../../../domain/rules/draft/create-item-id.rule';
import { createModule } from '../../../domain/rules/draft/create-module.rule';
import { moduleItemIds } from '../../../domain/rules/draft/module-item-ids.rule';
import { publishedItemKeys } from '../../../domain/rules/draft/published-item-keys.rule';
import { removeEntry } from '../../../domain/rules/list/remove-entry.rule';
import { replaceEntry } from '../../../domain/rules/list/replace-entry.rule';
import type { CourseEditor } from '../../types/course-editor.type';
import { ModuleForm } from './components/module-form/module-form';
import { ModuleList } from './components/module-list/module-list';
import styles from './modules-tab.module.css';

const MAX_MODULES = 30;

type Removal = { readonly kind: 'module' } | { readonly kind: 'lesson' | 'drill'; readonly index: number };

interface ModulesTabProps {
  readonly course: EditableCourse;
  readonly publishedContent: unknown;
  readonly update: CourseEditor['update'];
}

function describeRemoval(removal: Removal, module: EditableModule, published: ReadonlySet<string>) {
  if (removal.kind === 'module') {
    const isPublished = module.lessons.some((lesson) => published.has(`${module.id}-${lesson.id}`));
    return {
      title: `Remover "${module.title || module.id}"?`,
      text: isPublished
        ? 'O módulo está publicado. Quando esta versão sair, as aulas que as pessoas concluíram nele deixam de contar no progresso.'
        : 'O módulo ainda não foi publicado, então ninguém perde progresso.',
      confirm: 'Remover módulo',
    };
  }
  const item = removal.kind === 'lesson' ? module.lessons[removal.index] : module.drills[removal.index];
  const isLesson = removal.kind === 'lesson';
  const isPublished = item ? published.has(`${module.id}-${item.id}`) : false;
  const publishedText = isLesson
    ? 'Esta aula já está publicada. Quando esta versão sair, ela deixa de contar no progresso de quem já a concluiu.'
    : 'Este exercício já está publicado. Quando esta versão sair, ele deixa de contar no progresso de quem já o concluiu.';
  return {
    title: `Remover "${item?.title || (isLesson ? 'aula' : 'exercício')}"?`,
    text: isPublished ? publishedText : 'Ainda não foi publicado, então ninguém perde progresso.',
    confirm: removal.kind === 'lesson' ? 'Remover aula' : 'Remover exercício',
  };
}

export function ModulesTab({ course, publishedContent, update }: ModulesTabProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [removal, setRemoval] = useState<Removal | null>(null);
  const index = Math.min(selectedIndex, Math.max(course.modules.length - 1, 0));
  const module = course.modules[index];
  const published = publishedItemKeys(publishedContent);

  const setModule = (next: EditableModule) =>
    update((current) => ({ ...current, modules: replaceEntry(current.modules, index, next) }));
  const addModule = () => {
    update((current) => ({ ...current, modules: [...current.modules, createModule(current.modules)] }));
    setSelectedIndex(course.modules.length);
  };
  const addLesson = (target: EditableModule) =>
    setModule({ ...target, lessons: [...target.lessons, { id: createItemId('t', moduleItemIds(target), Math.random), title: '', summary: '', exercise: '' }] });
  const addDrill = (target: EditableModule) =>
    setModule({ ...target, drills: [...target.drills, { id: createItemId('e', moduleItemIds(target), Math.random), title: '', task: '' }] });

  const confirmRemoval = () => {
    if (!removal || !module) return;
    if (removal.kind === 'module') {
      update((current) => ({ ...current, modules: removeEntry(current.modules, index) }));
      setSelectedIndex(Math.max(index - 1, 0));
    } else if (removal.kind === 'lesson') {
      setModule({ ...module, lessons: removeEntry(module.lessons, removal.index) });
    } else {
      setModule({ ...module, drills: removeEntry(module.drills, removal.index) });
    }
    setRemoval(null);
  };

  const dialog = removal && module ? describeRemoval(removal, module, published) : null;

  return (
    <div className={styles.layout}>
      <ModuleList modules={course.modules} selectedIndex={index} canAdd={course.modules.length < MAX_MODULES} onSelect={setSelectedIndex} onAdd={addModule} />
      {module ? (
        <ModuleForm
          key={module.id}
          courseSlug={course.slug}
          module={module}
          code={`M${index + 1}`}
          onChange={setModule}
          onAddLesson={() => addLesson(module)}
          onRemoveLesson={(lessonIndex) => setRemoval({ kind: 'lesson', index: lessonIndex })}
          onAddDrill={() => addDrill(module)}
          onRemoveDrill={(drillIndex) => setRemoval({ kind: 'drill', index: drillIndex })}
          onRemoveModule={() => setRemoval({ kind: 'module' })}
        />
      ) : (
        <EmptyState title="O curso ainda não tem módulos" action={<Button tone="primary" onClick={addModule}>Adicionar o primeiro módulo</Button>}>
          Cada módulo tem aulas, exercícios de fixação e um projeto prático.
        </EmptyState>
      )}
      <Dialog
        open={dialog !== null}
        role="alertdialog"
        title={dialog?.title ?? ''}
        description={dialog?.text}
        onClose={() => setRemoval(null)}
        actions={
          <>
            <Button size="md" onClick={() => setRemoval(null)}>
              Manter
            </Button>
            <Button size="md" tone="danger-solid" onClick={confirmRemoval}>
              {dialog?.confirm}
            </Button>
          </>
        }
      />
    </div>
  );
}
