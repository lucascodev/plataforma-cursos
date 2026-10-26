const PATHS: Readonly<Record<'cloud' | 'shield' | 'download', string>> = {
  cloud: 'M17.5 19a4.5 4.5 0 0 0 0-9 6 6 0 0 0-11.7 1.5A4 4 0 0 0 6.5 19z',
  shield: 'M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z',
  download: 'M12 3v12M7 10l5 5 5-5M5 21h14',
};

export function PromiseIcon({ name }: { readonly name: keyof typeof PATHS }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={PATHS[name]} />
    </svg>
  );
}
