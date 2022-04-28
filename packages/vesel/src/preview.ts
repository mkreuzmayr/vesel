import path from 'node:path';
import { preview } from 'vite';
import { VeselConfig } from './config';
import { createElectronInstance } from './electron';

export async function previewMain(config: VeselConfig) {
  const mainConfig = config.main;

  const outdir = mainConfig.esbuild?.outdir ?? '';

  const electron = createElectronInstance({
    workingDirectory: process.cwd(),
    entryFile: path.join(outdir, 'index.js'),
  });

  electron.start();
}

export async function previewRenderer(config: VeselConfig) {
  const viteConfig = config.renderer.vite;
  await preview(viteConfig);
}
