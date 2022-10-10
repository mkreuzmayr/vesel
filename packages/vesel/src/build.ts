import { build as esbuild } from 'esbuild';
import path from 'node:path';
import { build as viteBuild } from 'vite';
import { VeselConfig } from './config';
import { createBrowserWindowPatcher } from './esbuild-plugins';

export async function buildMain(config: VeselConfig) {
  const mainConfig = config.main;

  const mainOutDir = mainConfig.esbuild.outdir!;
  const rendererOutDir = config.renderer.vite.build!.outDir!;

  const browserWindowPatcher = createBrowserWindowPatcher({
    env: 'build',
    rendererPath: path.relative(mainOutDir, rendererOutDir),
    devServerPort: config.renderer.vite.server?.port || 3000,
  });

  const esBuildPlugins = mainConfig.esbuild.plugins ?? [];

  await esbuild({
    minify: true,
    ...mainConfig.esbuild,
    plugins: [...esBuildPlugins, browserWindowPatcher],
  });
}

export async function buildRenderer(config: VeselConfig) {
  const viteConfig = config.renderer.vite;
  await viteBuild({ base: '', ...viteConfig });
}
