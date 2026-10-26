const NUMBER_FORMAT = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });

// In Portuguese, amounts from 1 up to (not including) 2 take the singular: "1 mês", "1,5 mês", "2 meses".
export function pluralize(count: number, singular: string, plural: string): string {
  return `${NUMBER_FORMAT.format(count)} ${count >= 1 && count < 2 ? singular : plural}`;
}
