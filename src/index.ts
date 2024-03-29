import { registerPlugin, getPluginTypes } from 'release-please'
import { logger } from 'release-please/build/src/util/logger'

import { builder } from './builder';

export function init() {
  registerPlugin('release-please-scope-package-plugin', builder);
  logger.info('[ScopePackagePlugin] registered as "release-please-scope-package-plugin"');
};

init();
