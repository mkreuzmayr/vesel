import { build as esbuild } from 'esbuild';
import { build as viteBuild } from 'vite';
import { VeselConfig } from './config';
import { createBrowserWindowPatcher } from './esbuild-plugins';

export async function buildMain(config: VeselConfig) {
  const mainConfig = config.main;

  const browserWindowPatcher = createBrowserWindowPatcher({
    env: 'build',
    rendererPath: config.renderer.vite.build!.outDir!,
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
