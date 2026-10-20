export function pluginPath(currentPath: string, relativePath: string, pluginId: string): string {
  if (relativePath.startsWith('/') || relativePath.includes('..')) throw new Error('Use a plugin-relative route');
  const shellBase = `/p/${pluginId}`;
  const base = currentPath === shellBase || currentPath.startsWith(`${shellBase}/`) ? shellBase : '';
  return relativePath ? `${base}/${relativePath}` : base || '/';
}
