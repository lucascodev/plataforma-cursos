import { describe, expect, it } from 'vitest';
import type { CatalogSearchable } from '../../types/catalog-searchable.type';
import { courseLevelKey } from './course-level-key.rule';
import { filterCatalog } from './filter-catalog.rule';
import { matchesCatalogQuery } from './matches-catalog-query.rule';

const course = (title: string, level: string, moduleTitle = 'Fundamentos'): CatalogSearchable => ({
  title,
  tagline: 'Chamada',
  description: 'Descrição',
  level,
  audience: 'Devs',
  modules: [{ title: moduleTitle, shortTitle: moduleTitle, projectTitle: 'Projeto' }],
});

describe('regras do catálogo', () => {
  it('reconhece o nível escrito com ou sem acento', () => {
    expect(courseLevelKey('Intermediário')).toBe('intermediario');
    expect(courseLevelKey('avançado (com IA)')).toBe('avancado');
    expect(courseLevelKey('Para todos')).toBeNull();
  });

  it('busca cada palavra ignorando acentos, inclusive nos módulos', () => {
    const ia = course('Engenharia de IA', 'Intermediário', 'Agentes e MCP');
    expect(matchesCatalogQuery(ia, 'engenharia')).toBe(true);
    expect(matchesCatalogQuery(ia, 'AGENTES ia')).toBe(true);
    expect(matchesCatalogQuery(ia, 'intermediario')).toBe(true);
    expect(matchesCatalogQuery(ia, 'banco')).toBe(false);
    expect(matchesCatalogQuery(ia, '   ')).toBe(true);
  });

  it('combina busca e nível', () => {
    const courses = [course('Engenharia de IA', 'Intermediário'), course('Git do zero', 'Iniciante')];
    expect(filterCatalog(courses, '', 'iniciante').map((entry) => entry.title)).toEqual(['Git do zero']);
    expect(filterCatalog(courses, 'git', 'intermediario')).toEqual([]);
    expect(filterCatalog(courses, '', null)).toHaveLength(2);
  });
});
