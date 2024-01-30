import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  entries: ['src/index'],
  rollup: {
    emitCJS: true,
  },

  outDir: 'dist',
  declaration: true,
});
