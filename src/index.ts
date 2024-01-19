import { registerPlugin, getPluginTypes } from 'release-please'
import { logger } from 'release-please/build/src/util/logger'

import { builder } from './builder';

export function init() {
  registerPlugin('@ipfs-shipyard/release-please-ipfs-plugin', builder);
  logger.info('registered @educorg/release-please-scope-package-plugin');
};

init();
