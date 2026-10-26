export interface GuideSection {
  readonly title: string;
  readonly intro: string | null;
  readonly items: readonly string[];
  readonly link: { readonly label: string; readonly url: string } | null;
}
