const FORMAT = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' });

export function formatShortDate(timestamp: string): string {
  return FORMAT.format(new Date(timestamp)).replace(/\./g, '');
}
