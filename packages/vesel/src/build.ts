import { build as esbuild } from 'esbuild';
import { build as viteBuild } from 'vite';
import { createBrowserWindowPatcher } from './browserWindowPatcher';
import { VeselConfig } from './config';

export async function buildMain(config: VeselConfig) {
  const mainConfig = config.main;

  const browserWindowPatcher = createBrowserWindowPatcher(config, 'build');
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
