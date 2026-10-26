import { Search } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '@/shared/presentation/components/actions/button/button';
import { EmptyState } from '@/shared/presentation/components/feedback/empty-state/empty-state';
import { PageStatus } from '@/shared/presentation/components/feedback/page-status/page-status';
import { Skeleton } from '@/shared/presentation/components/feedback/skeleton/skeleton';
import { CourseCard } from '../../components/course-card/course-card';
import { CATALOG_LEVEL_OPTIONS } from '../../constants/catalog-level-options';
import { useCatalogFilters } from '../../hooks/use-catalog-filters/use-catalog-filters';
import { useCourseCatalogQuery } from '../../hooks/use-course-catalog-query/use-course-catalog-query';
import styles from './catalog-page.module.css';

export function CatalogPage() {
  const catalog = useCourseCatalogQuery();
  const filters = useCatalogFilters(catalog.data ?? []);

  if (catalog.isError) return <PageStatus title="Não foi possível carregar os cursos" />;

  return (
    <div className={styles.page}>
      <title>Cursos</title>
      <div className={styles.header}>
        <div className={styles.heading}>
          <h1 className={styles.title}>Cursos</h1>
          <p className={styles.lead}>Todos gratuitos, com plano diário e um projeto prático por módulo.</p>
        </div>
        <label className={styles.search}>
          Buscar curso
          <span className={styles.searchBox}>
            <Search size={18} aria-hidden="true" />
            <input type="search" value={filters.query} placeholder="Ex.: IA, Git, banco de dados" onChange={(event) => filters.setQuery(event.target.value)} />
          </span>
        </label>
      </div>

      <div className={styles.levels} role="group" aria-label="Filtrar por nível">
        {CATALOG_LEVEL_OPTIONS.map((option) => (
          <button
            key={option.label}
            type="button"
            className={styles.level}
            aria-pressed={filters.level === option.key}
            onClick={() => filters.setLevel(option.key)}
          >
            {option.label}
          </button>
        ))}
      </div>

      {catalog.isPending ? (
        <Skeleton height="420px" radius="md" />
      ) : filters.visible.length > 0 ? (
        <div className={styles.list}>
          {filters.visible.map((course) => (
            <CourseCard key={course.slug} course={course} />
          ))}
        </div>
      ) : (
        <EmptyState title={catalog.data.length === 0 ? 'Nenhum curso publicado ainda' : filters.emptyTitle} action={catalog.data.length > 0 ? <Button onClick={filters.clear}>Limpar filtros</Button> : null}>
          <p>Qualquer pessoa pode propor um curso novo. Se a proposta for aprovada, ela vira professora e escreve o curso aqui mesmo.</p>
        </EmptyState>
      )}

      <aside className={styles.teach}>
        <div>
          <p className={styles.teachTitle}>Quer ensinar alguma coisa?</p>
          <p className={styles.teachText}>
            Mande uma proposta. Quem mantém a plataforma responde em até 7 dias; se aprovada, você escreve as aulas e a plataforma monta o plano diário.
          </p>
        </div>
        <Link className={styles.teachLink} to="/propor-curso">
          Propor um curso
        </Link>
      </aside>
    </div>
  );
}
