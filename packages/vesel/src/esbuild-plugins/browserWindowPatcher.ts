import { Plugin } from 'esbuild';
import { createImportPatcher } from './importPatcher';

type PatchEnv = 'dev' | 'build';

export type BrowserWindowPatcherOptions = {
  rendererPath: string;
  devServerPort: number;
  env: PatchEnv;
};

export function createBrowserWindowPatcher({
  rendererPath,
  devServerPort,
  env,
}: BrowserWindowPatcherOptions): Plugin {
  return createImportPatcher({
    moduleName: 'electron',
    importName: 'BrowserWindow',
    replaceValue: ({ importLine, importVarName }) =>
      buildPatchFunction({
        env,
        importLine,
        rendererPath,
        browserWindowVariableName: importVarName,
        devServerPort,
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
      url = url.replace('file://', 'file://' + '/' + __dirname + '/' + webroot);

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
