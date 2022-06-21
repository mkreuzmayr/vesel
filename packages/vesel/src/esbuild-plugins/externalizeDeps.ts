import { Plugin } from 'esbuild';
import path from 'node:path';

export const externalizeDeps: Plugin = {
  name: 'externalize-deps',
  setup(build) {
    build.onResolve({ filter: /.*/ }, (args) => {
      const id = args.path;
      if (id[0] !== '.' && !path.isAbsolute(id)) {
        return {
          external: true,
        };
      }
    });
  },
};
