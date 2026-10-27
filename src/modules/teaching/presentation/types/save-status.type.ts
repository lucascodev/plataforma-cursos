/** conflict: the draft changed in another tab or device; autosave stops until the page is reloaded. */
export type SaveStatus = 'saved' | 'pending' | 'saving' | 'error' | 'conflict';
