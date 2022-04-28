import { Plugin } from 'esbuild';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

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

type OnPatchFnParams = {
  importLine: string;
  importVarName: string;
};

type ImportPatcherOptions = {
  moduleName: string;
  importName: string;
  replaceValue:
    | ((params: OnPatchFnParams) => Promise<string> | string)
    | string;
};

export function createImportPatcher(options: ImportPatcherOptions): Plugin {
  const { importName, moduleName, replaceValue } = options;

  const patchRegexStr = String.raw`import[^B'"]*${importName}(?:\s*as\s*(\w+))?[^'"]*['"]${moduleName}['"];?`;
  const patchRegex = RegExp(patchRegexStr, 'gm');

  return {
    name: 'import-patcher',
    setup(build) {
      build.onLoad({ filter: /\.[jt]s$/ }, async (args) => {
        const contents = await readFile(args.path, 'utf8');
        const importMatch = patchRegex.exec(contents);

        if (!importMatch) {
          return;
        }

        let resolvedReplaceValue = '';

        if (typeof replaceValue === 'function') {
          const importVarName = importMatch[1] || importName;
          resolvedReplaceValue = await replaceValue({
            importLine: importMatch[0],
            importVarName,
          });
        } else {
          resolvedReplaceValue = replaceValue;
        }

        const patchedContents = contents.replace(
          patchRegex,
          resolvedReplaceValue
        );

        return {
          loader: args.path.endsWith('.ts') ? 'ts' : 'js',
          contents: patchedContents,
        };
      });
    },
  };
}
