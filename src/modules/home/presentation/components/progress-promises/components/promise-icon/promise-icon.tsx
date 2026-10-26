import { Cloud, Download, ShieldCheck, type LucideIcon } from 'lucide-react';

const ICONS: Readonly<Record<'cloud' | 'shield' | 'download', LucideIcon>> = {
  cloud: Cloud,
  shield: ShieldCheck,
  download: Download,
};

export function PromiseIcon({ name }: { readonly name: keyof typeof ICONS }) {
  const Icon = ICONS[name];
  return <Icon size={28} color="var(--accent)" strokeWidth={1.8} aria-hidden="true" />;
}
