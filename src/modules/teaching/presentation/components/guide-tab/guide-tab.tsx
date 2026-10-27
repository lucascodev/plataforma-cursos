import { Plus } from 'lucide-react';
import { Button } from '@/shared/presentation/components/actions/button/button';
import { TextAreaField } from '@/shared/presentation/components/form/text-area-field/text-area-field';
import { TextField } from '@/shared/presentation/components/form/text-field/text-field';
import type { EditableCourse } from '../../../domain/entities/draft/editable-course.entity';
import type { EditableGuideSection } from '../../../domain/entities/draft/editable-guide-section.entity';
import { moveEntry } from '../../../domain/rules/list/move-entry.rule';
import { removeEntry } from '../../../domain/rules/list/remove-entry.rule';
import { replaceEntry } from '../../../domain/rules/list/replace-entry.rule';
import styles from '../../styles/editor.module.css';
import type { CourseEditor } from '../../types/course-editor.type';
import { ItemActions } from '../item-actions/item-actions';
import { TextListEditor } from '../text-list-editor/text-list-editor';

const MAX_SECTIONS = 8;
const EMPTY_SECTION: EditableGuideSection = { title: '', items: [''] };

interface GuideTabProps {
  readonly course: EditableCourse;
  readonly update: CourseEditor['update'];
}

export function GuideTab({ course, update }: GuideTabProps) {
  const sections = course.guide?.sections ?? [];
  const setSections = (next: readonly EditableGuideSection[]) =>
    update((current) => ({ ...current, guide: { ...current.guide, sections: [...next] } }));
  const setSection = (index: number, patch: Partial<EditableGuideSection>) => {
    const section = sections[index];
    if (section) setSections(replaceEntry(sections, index, { ...section, ...patch }));
  };

  return (
    <div className={styles.fields}>
      <section className={styles.card} aria-labelledby="guia-secoes">
        <h2 id="guia-secoes" className={styles.cardTitle}>
          Guia do curso
        </h2>
        <p className={styles.cardHint}>Seções que aparecem na página do curso, abaixo dos módulos, na ordem desta lista.</p>
        {sections.length === 0 ? <p className={styles.muted}>Nenhuma seção ainda. Um guia curto ajuda quem está começando.</p> : null}
        <ol className={styles.list}>
          {sections.map((section, index) => (
            <li key={index} className={styles.item}>
              <div className={styles.itemHeader}>
                <p className={styles.itemLabel}>Seção {index + 1}</p>
                <ItemActions
                  label={`seção ${index + 1}`}
                  index={index}
                  count={sections.length}
                  onMove={(delta) => setSections(moveEntry(sections, index, delta))}
                  onRemove={() => setSections(removeEntry(sections, index))}
                />
              </div>
              <TextField label="Título" value={section.title} maxLength={120} onChange={(event) => setSection(index, { title: event.target.value })} />
              <TextAreaField
                label="Introdução (opcional)"
                rows={2}
                value={section.intro ?? ''}
                maxLength={600}
                onChange={(event) => setSection(index, { intro: event.target.value || undefined })}
              />
              <TextListEditor
                title="Itens"
                itemLabel="Item"
                addLabel="Adicionar item"
                items={section.items}
                maxLength={500}
                onChange={(items) => setSection(index, { items })}
              />
            </li>
          ))}
        </ol>
        <div>
          <Button disabled={sections.length >= MAX_SECTIONS} onClick={() => setSections([...sections, EMPTY_SECTION])}>
            <Plus size={16} aria-hidden="true" />
            Adicionar seção
          </Button>
        </div>
      </section>
      {course.guide?.architecture ? (
        <p className={styles.muted}>O diagrama de arquitetura do curso é mantido como está. O editor dele chega numa próxima versão da plataforma.</p>
      ) : null}
    </div>
  );
}
