/** Évite les redirections ouvertes: seul un chemin interne ("/...") est accepté, jamais "//site" ni "http:". */
export function safeReturnUrl(url: string | null | undefined): string {
  return url && url.startsWith('/') && !url.startsWith('//') && !url.includes('\\') ? url : '/';
}
