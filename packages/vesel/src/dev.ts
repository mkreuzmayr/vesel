import chalk from 'chalk';
import { build as esbuild } from 'esbuild';
import { move } from 'fs-extra';
import path from 'node:path';
import { createServer as createViteServer } from 'vite';
import { createBrowserWindowPatcher } from './browserWindowPatcher';
import { VeselConfig } from './config';
import { createElectronInstance } from './electron';
import { sleep } from './utils';

export async function watchMain(config: VeselConfig) {
  const mainConfig = config.main;

  const hasNativeNodeModulesPlugin = mainConfig.esbuild.plugins?.some(
    (plugin) => plugin.name === 'vesel-native-node-modules'
  );

  const electron = createElectronInstance({
    workingDirectory: process.cwd(),
    entryFile: path.join(mainConfig.outdirDev, 'index.js'),
  });

  async function copyDev(retries: number = 0) {
    try {
      await move(mainConfig.tempdir, mainConfig.outdirDev, { overwrite: true });
    } catch (err) {
      // if native node module support is enabled
      // wait until electron app has released resources
      if (hasNativeNodeModulesPlugin && retries < 3) {
        await sleep(150 * 2 ** retries);
        await copyDev(retries + 1);
      } else {
        console.log(
          chalk.red(`Failed to copy dev files to ${mainConfig.outdirDev}`)
        );
      }
    }
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
