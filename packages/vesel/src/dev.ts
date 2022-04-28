import chalk from 'chalk';
import { build as esbuild } from 'esbuild';
import { move } from 'fs-extra';
import path from 'node:path';
import { createServer as createViteServer } from 'vite';
import { createBrowserWindowPatcher } from './browserWindowPatcher';
import { VeselConfig } from './config';
import { createElectronInstance } from './electron';

export async function watchMain(config: VeselConfig) {
  const mainConfig = config.main;

  const electron = createElectronInstance({
    workingDirectory: process.cwd(),
    entryFile: path.join(mainConfig.outdirDev, 'index.js'),
  });

  async function copyDev() {
    await move(mainConfig.tempdir, mainConfig.outdirDev, { overwrite: true });
  }

  const browserWindowPatcher = createBrowserWindowPatcher(config, 'dev');
  const esBuildPlugins = mainConfig.esbuild.plugins ?? [];

  await esbuild({
    ...mainConfig.esbuild,
    plugins: [...esBuildPlugins, browserWindowPatcher],
    outdir: mainConfig.tempdir,
    watch: {
      async onRebuild(error) {
        if (error) {
          console.error(chalk.red('Rebuild failed:'), error);
        } else {
          console.log(chalk.green('Rebuild succeeded, reloading...'));
          electron.stop();
          await copyDev();
          electron.start();
        }
      },
    },
  });

  await copyDev();
  electron.start();

  console.log(chalk.green('Build finished, watching for changes...'));

  process.on('SIGINT', () => {
    electron.stop();
    process.exit(0);
  });
}

export async function watchRenderer(config: VeselConfig) {
  const viteConfig = config.renderer.vite;

  const server = await createViteServer(viteConfig);

  server.listen();
}
