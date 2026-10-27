const COURSE_FIELDS: Readonly<Record<string, string>> = {
  slug: 'Endereço',
  title: 'Título',
  tagline: 'Frase curta',
  description: 'Descrição',
  level: 'Nível',
  audience: 'Para quem é',
  version: 'Versão',
  updatedAt: 'Data',
  rhythm: 'Ritmo da semana',
  kickoff: 'Primeiro dia',
  sundayTrack: 'Trilha de domingo',
  guide: 'Guia',
  modules: 'Módulos',
};

const NESTED_FIELDS: Readonly<Record<string, string>> = {
  id: 'id',
  title: 'título',
  shortTitle: 'nome curto',
  kind: 'tipo',
  months: 'duração',
  projectDays: 'dias de projeto',
  prerequisite: 'pré-requisito',
  goal: 'objetivo',
  caseStudy: 'caso de estudo',
  lowSpecTip: 'dica para computador modesto',
  lessons: 'aulas',
  drills: 'exercícios de fixação',
  summary: 'resumo',
  exercise: 'exercício',
  task: 'tarefa',
  project: 'projeto',
  brief: 'enunciado',
  requirements: 'requisitos',
  doneCriteria: 'pronto quando',
  selfCheck: 'autoavaliação',
  resources: 'material de apoio',
  label: 'nome',
  url: 'link',
  type: 'tipo',
  detail: 'o que fazer',
  weekdayHours: 'segunda a sexta',
  saturdayHours: 'sábado',
  sundayHours: 'domingo',
  sections: 'seções',
  items: 'itens',
  intro: 'introdução',
  architecture: 'diagrama',
  rotation: 'rodízio',
  milestones: 'marcos',
  moduleId: 'módulo',
};

const INDEXED_PARTS: Readonly<Record<string, string>> = {
  lessons: 'aula',
  drills: 'exercício de fixação',
  resources: 'material',
  selfCheck: 'pergunta',
  requirements: 'requisito',
  doneCriteria: 'critério',
  sections: 'seção',
  items: 'item',
  rotation: 'tarefa',
  milestones: 'marco',
};

// Turns a schema path into the place a teacher recognizes: ["modules", 1, "lessons", 2, "summary"] → "M2 · aula 3 · resumo".
export function describeCoursePath(path: readonly PropertyKey[]): string {
  const [head, ...rest] = path;
  if (head === undefined) return 'Curso';
  const parts: string[] = [];
  let remaining = rest;
  if (head === 'modules' && typeof rest[0] === 'number') {
    parts.push(`M${rest[0] + 1}`);
    remaining = rest.slice(1);
  } else {
    parts.push(COURSE_FIELDS[String(head)] ?? String(head));
  }
  remaining.forEach((part, index) => {
    if (typeof part === 'number') return;
    const next = remaining[index + 1];
    const indexed = INDEXED_PARTS[String(part)];
    if (indexed && typeof next === 'number') parts.push(`${indexed} ${next + 1}`);
    else parts.push(NESTED_FIELDS[String(part)] ?? String(part));
  });
  return parts.join(' · ');
}
