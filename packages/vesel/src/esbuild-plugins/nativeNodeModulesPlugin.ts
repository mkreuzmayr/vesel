import { Plugin } from 'esbuild';
import fs from 'fs-extra';
import path from 'node:path';

type NativeNodeModulePathResolution = {
  definition: string;
  module: string;
};

type CreateNativeNodeModulesOptions = {
  resolutionPaths?: NativeNodeModulePathResolution[];
};

export function createNativeNodeModulesPlugin({
  resolutionPaths = [],
}: CreateNativeNodeModulesOptions): Plugin {
  const resolvedResolutionPaths = resolutionPaths.map(
    ({ definition, module }) => ({
      definition: path.resolve(definition),
      module: path.resolve(module),
    })
  );

  // This plugin is used to resolve ".node" files
  // to absolute paths in the build folder.
  // https://github.com/evanw/esbuild/issues/1051
  const nativeNodeModulesPlugin: Plugin = {
    name: 'vesel-native-node-modules',
    setup(build) {
      // If a ".node" file is imported within a module in the "file" namespace, resolve
      // it to an absolute path and put it into the "node-file" virtual namespace.
      build.onResolve({ filter: /\.node$/, namespace: 'file' }, (args) => {
        const namespace = 'node-file';
        const resolvedImportPath = path.resolve(args.resolveDir, args.path);

        if (fs.existsSync(resolvedImportPath)) {
          return {
            path: resolvedImportPath,
            namespace,
          };
        }

        for (const { definition, module } of resolvedResolutionPaths) {
          if (definition.startsWith(resolvedImportPath)) {
            return {
              path: module,
              namespace,
            };
          }
        }

        throw new Error(`Could not resolve native node module "${args.path}"`);
      });

      // Files in the "node-file" virtual namespace call "require()" on the
      // path from esbuild of the ".node" file in the output directory.
      build.onLoad({ filter: /.*/, namespace: 'node-file' }, (args) => ({
        contents: `
        import path from ${JSON.stringify(args.path)}
        try { module.exports = require(path) }
        catch {}
      `,
      }));

      // If a ".node" file is imported within a module in the "node-file" namespace, put
      // it in the "file" namespace where esbuild's default loading behavior will handle
      // it. It is already an absolute path since we resolved it to one above.
      build.onResolve(
        { filter: /\.node$/, namespace: 'node-file' },
        (args) => ({
          path: args.path,
          namespace: 'file',
        })
      );

      // Tell esbuild's default loading behavior to use the "file" loader for
      // these ".node" files.
      const opts = build.initialOptions;
      opts.loader = opts.loader || {};
      opts.loader['.node'] = 'file';
    },
  };

  return nativeNodeModulesPlugin;
}
