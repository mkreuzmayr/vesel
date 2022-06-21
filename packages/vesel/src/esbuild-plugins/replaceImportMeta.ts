import { Plugin } from 'esbuild';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const replaceImportMeta: Plugin = {
  name: 'replace-import-meta',
  setup(build) {
    build.onLoad({ filter: /\.[jt]s$/ }, async (args) => {
      const contents = await readFile(args.path, 'utf8');
      return {
        loader: args.path.endsWith('.ts') ? 'ts' : 'js',
        contents: contents
          .replace(
            /\bimport\.meta\.url\b/g,
            JSON.stringify(pathToFileURL(args.path).href)
          )
          .replace(/\b__dirname\b/g, JSON.stringify(path.dirname(args.path)))
          .replace(/\b__filename\b/g, JSON.stringify(args.path)),
      };
    });
  },
};
