export type AttentionItem =
  | { readonly kind: 'proposal'; readonly id: string; readonly title: string; readonly since: string }
  | {
      readonly kind: 'version';
      readonly id: string;
      readonly title: string;
      readonly semver: string | null;
      readonly firstPublication: boolean;
      readonly since: string;
    }
  | { readonly kind: 'report'; readonly id: string; readonly title: string; readonly handle: string; readonly count: number; readonly since: string };
