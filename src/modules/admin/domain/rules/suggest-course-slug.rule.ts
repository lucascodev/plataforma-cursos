const MAX_SLUG_LENGTH = 60;

// "Introdução à Análise de Dados!" becomes "introducao-a-analise-de-dados".
export function suggestCourseSlug(title: string): string {
  return title
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, MAX_SLUG_LENGTH)
    .replace(/-+$/g, '');
}
