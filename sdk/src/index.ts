import type { Component } from 'vue';

export type PluginCapability = 'storage' | 'network' | 'native';

export type PluginViewer =
  | { readonly kind: 'guest' }
  | { readonly kind: 'user'; readonly tier: number; readonly roles: readonly string[] };

/** Rules are OR'ed; fields inside one signed-in rule are AND'ed. */
export type PluginVisibilityRule =
  | { readonly kind: 'guest' }
  | { readonly kind: 'signed-in'; readonly minTier?: number; readonly anyRole?: readonly string[] };

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  capabilities: readonly PluginCapability[];
  /** Omission keeps existing plugins visible to everyone. An empty list hides the plugin. */
  visibility?: readonly PluginVisibilityRule[];
  /** Omission uses the visibility policy. This can restrict opening a visible plugin. */
  access?: readonly PluginVisibilityRule[];
}

export interface PluginMenuItem {
  label: string;
  icon?: string;
  route: string;
}

export interface PluginRoute {
  /** Relative path below /p/:pluginId. Empty string is the plugin home page. */
  path: string;
  /** Optional title for the Shell-owned platform control bar. */
  title?: string;
  component: Component;
}

export interface PluginContext {
  readonly manifest: PluginManifest;
  readonly capabilities: ReadonlySet<PluginCapability>;
}

/** Storage keys are isolated to one plugin by the Core implementation. */
export interface PluginStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface AppPlugin {
  readonly manifest: PluginManifest;
  readonly menu: readonly PluginMenuItem[];
  readonly routes: readonly PluginRoute[];
  onEnable?(context: PluginContext): void | Promise<void>;
  onDisable?(context: PluginContext): void | Promise<void>;
}

export function definePlugin<T extends AppPlugin>(plugin: T): T {
  return plugin;
}
