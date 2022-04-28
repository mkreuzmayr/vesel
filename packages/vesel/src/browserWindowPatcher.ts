import { Plugin } from 'esbuild';
import { VeselConfig } from './config';
import { createImportPatcher } from './esBuildPlugins';

type PatchEnv = 'dev' | 'build';

export function createBrowserWindowPatcher(
  config: VeselConfig,
  env: PatchEnv
): Plugin {
  return createImportPatcher({
    moduleName: 'electron',
    importName: 'BrowserWindow',
    replaceValue: ({ importLine, importVarName }) =>
      buildPatchFunction({
        env,
        importLine,
        rendererPath: config.renderer.vite.build!.outDir!,
        browserWindowVariableName: importVarName,
        devServerPort: config.renderer.vite.server?.port || 3000,
      }),
  });
}

type BuildPatchFunctionOptions = {
  env: PatchEnv;
  rendererPath: string;
  importLine: string;
  browserWindowVariableName: string;
  devServerPort: number;
};

function buildPatchFunction(options: BuildPatchFunctionOptions) {
  const {
    env,
    rendererPath,
    importLine,
    browserWindowVariableName,
    devServerPort,
  } = options;

  if (env === 'build') {
    const prettyRendererPath = rendererPath.replace(/\\/g, '/');
    return `
    ${importLine};
    ${browserWindowVariableName}.prototype.loadURL = function (...args) {
      let [url, ...otherArgs] = args;

      const webroot = '${prettyRendererPath}/';
      url = url.replace('file://', 'file://' + webroot);

      return this.webContents.loadURL(url, ...otherArgs);
    };
    `;
  }

  return `
	${importLine};
	${browserWindowVariableName}.prototype.loadURL = function (...args) {
		let [url, ...otherArgs] = args;

		if (url.startsWith('file://')) {
			url = url.replace('file://', 'http://localhost:${devServerPort}/');
		}

		return this.webContents.loadURL(url, ...otherArgs);
	};
	`;
}
