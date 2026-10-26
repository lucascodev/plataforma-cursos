export interface CatalogSearchable {
  readonly title: string;
  readonly tagline: string;
  readonly description: string;
  readonly level: string;
  readonly audience: string;
  readonly modules: readonly { readonly title: string; readonly shortTitle: string; readonly projectTitle: string }[];
}
