// GitHub creates a Codespace from the repository at this address; the person's own free quota pays for it.
export function codespacesUrl(repoUrl: string): string {
  return repoUrl.replace(/^https:\/\/github\.com\//, 'https://codespaces.new/');
}
