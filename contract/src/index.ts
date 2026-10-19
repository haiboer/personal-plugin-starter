export const HOST_PROTOCOL = '1.0' as const;
export type Capability = 'profile.basic' | 'navigation.openExternal';
export interface PluginManifestV1 {
  schemaVersion: typeof HOST_PROTOCOL;
  id: string;
  version: string;
  name: string;
  description: string;
  entry: { shell: string; standalone?: string };
  routes: { path: string; title: string }[];
  menu: { label: string; route: string }[];
  capabilities: Capability[];
  backend: { audience: string; origin: string };
  data: { owner: 'plugin'; exportSchemaVersion: number };
}
export interface PluginHostV1 {
  readonly protocol: typeof HOST_PROTOCOL;
  readonly pluginId: string;
  readonly mode: 'shell' | 'standalone';
  session(): Promise<{ state: 'guest' | 'signed-in'; displayName?: string; pluginSubject?: string }>;
  access(): Promise<{ visible: boolean; usable: boolean; reason?: 'login' | 'tier' | 'role' | 'disabled' | 'expired' }>;
  navigate(path: string): Promise<void>;
  requestCapability<T>(name: Capability, input: unknown): Promise<T>;
  on(event: 'sessionChanged' | 'accessChanged' | 'dispose', handler: () => void): () => void;
}
