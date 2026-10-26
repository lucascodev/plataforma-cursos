import { Button } from '@/shared/presentation/components/actions/button/button';
import { Notice } from '@/shared/presentation/components/feedback/notice/notice';
import { CheckboxField } from '@/shared/presentation/components/form/checkbox-field/checkbox-field';
import { TextAreaField } from '@/shared/presentation/components/form/text-area-field/text-area-field';
import { TextField } from '@/shared/presentation/components/form/text-field/text-field';
import type { MyProfile } from '../../../domain/entities/my-profile.entity';
import { useProfileForm } from '../../hooks/use-profile-form/use-profile-form';
import { LinksEditor } from './components/links-editor/links-editor';
import styles from './profile-form.module.css';

export function ProfileForm({ profile }: { profile: MyProfile }) {
  const form = useProfileForm(profile);
  const isTeacher = profile.role !== 'student';

  return (
    <form className={styles.form} onSubmit={form.submit} noValidate>
      <TextField label="Nome" value={form.displayName} maxLength={80} required onChange={(event) => form.setDisplayName(event.target.value)} />
      <TextAreaField
        label="Sobre você"
        hint={isTeacher ? 'Aparece na sua página pública de professor.' : 'Só você vê. Vira público se um dia você der um curso.'}
        value={form.bio}
        maxLength={1000}
        onChange={(event) => form.setBio(event.target.value)}
      />
      <LinksEditor links={form.links} canAdd={form.canAddLink} onAdd={form.addLink} onChange={form.updateLink} onRemove={form.removeLink} />
      {isTeacher ? (
        <CheckboxField checked={form.showStudentCount} onChange={(event) => form.setShowStudentCount(event.target.checked)}>
          Mostrar quantas pessoas estudam meus cursos na página pública
        </CheckboxField>
      ) : null}
      {form.error ? <Notice tone="warning">{form.error}</Notice> : null}
      {form.saved && !form.error ? <Notice tone="success">Perfil salvo.</Notice> : null}
      <div>
        <Button type="submit" tone="primary" disabled={form.isSaving}>
          {form.isSaving ? 'Salvando…' : 'Salvar perfil'}
        </Button>
      </div>
    </form>
  );
}
