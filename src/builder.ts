import { type PluginBuilder } from 'release-please/build/src/factories/plugin-factory';

import { ScopePackagePlugin, type ScopePackagePluginConfig } from './plugin';

export const builder: PluginBuilder = (options) =>
  new ScopePackagePlugin(
    options.github,
    options.targetBranch,
    options.repositoryConfig,
    (options.type as ScopePackagePluginConfig).packages,
  );
