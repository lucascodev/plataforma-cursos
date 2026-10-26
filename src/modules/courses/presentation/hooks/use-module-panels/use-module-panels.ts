import { useState } from 'react';

export function useModulePanels(initiallyOpenId: string | null) {
  const [openIds, setOpenIds] = useState<ReadonlySet<string> | null>(null);
  const current = openIds ?? new Set(initiallyOpenId ? [initiallyOpenId] : []);

  const setOpen = (moduleId: string, open: boolean) => {
    const next = new Set(current);
    if (open) next.add(moduleId);
    else next.delete(moduleId);
    setOpenIds(next);
  };

  return {
    isOpen: (moduleId: string) => current.has(moduleId),
    toggle: (moduleId: string) => setOpen(moduleId, !current.has(moduleId)),
    openAndReveal: (moduleId: string) => {
      setOpen(moduleId, true);
      requestAnimationFrame(() => document.getElementById(`modulo-${moduleId}`)?.scrollIntoView({ block: 'start' }));
    },
  };
}
