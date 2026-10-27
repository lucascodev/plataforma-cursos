export type VersionKind = 'first' | 'patch' | 'minor' | 'major';

export type SubmittableVersionKind = Exclude<VersionKind, 'first'>;
