import path from 'node:path';
import { VeselConfig } from './config';
import { createElectronInstance } from './electron';

export async function previewApp(config: VeselConfig) {
  const mainConfig = config.main;

  const outdir = mainConfig.esbuild?.outdir ?? '';

  const electron = createElectronInstance({
    workingDirectory: process.cwd(),
    entryFile: path.join(outdir, 'index.js'),
  });

  electron.start();
}
