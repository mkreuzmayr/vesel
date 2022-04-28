import { build, BuildOptions } from 'esbuild';
import { existsSync, unlinkSync } from 'node:fs';
import { builtinModules } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { UserConfig } from 'vite';
import { externalizeDeps, replaceImportMeta } from './esBuildPlugins';
import { dynamicImport, PartialDeep } from './utils';

export type VeselConfig = {
  main: {
    outdirDev: string;
    tempdir: string;
    esbuild: BuildOptions;
  };
  renderer: {
    vite: UserConfig;
  };
};

export type VeselUserConfig = PartialDeep<VeselConfig>;

const defaultConfig: VeselConfig = {
  main: {
    outdirDev: path.resolve('.vesel/dev/main'),
    tempdir: path.resolve('.vesel/tmp/main'),
    esbuild: {
      entryPoints: [path.resolve('src/main/index.ts')],
      platform: 'node',
      bundle: true,
      external: ['electron', 'fsevents', ...builtinModules],
      outdir: path.resolve('build/main'),
    },
  },
  renderer: {
    vite: {
      root: path.resolve('src/renderer'),
      build: {
        outDir: path.resolve('build/renderer'),
      },
      server: {
        port: 3000,
      },
    },
  },
};

function applyDefaultConfigValues(config: VeselUserConfig): VeselConfig {
  return {
    ...defaultConfig,
    ...config,
    main: {
      ...defaultConfig.main,
      ...config.main,
      esbuild: {
        ...defaultConfig.main?.esbuild,
        ...config.main?.esbuild,
      } as BuildOptions,
    },
    renderer: {
      ...defaultConfig.renderer,
      ...config.renderer,
      vite: {
        ...defaultConfig.renderer?.vite,
        ...config.renderer?.vite,
        build: {
          ...defaultConfig.renderer?.vite?.build,
          ...config.renderer?.vite?.build,
        },
        server: {
          ...defaultConfig.renderer?.vite?.server,
          ...config.renderer?.vite?.server,
        },
      } as UserConfig,
    },
  };
}

async function loadConfigFromFile(
  configPath: string
): Promise<VeselConfig | null> {
  const tmpConfigPath = path.resolve('.vesel/tmp/config.mjs');

  if (!existsSync(configPath)) {
    return null;
  }

  await build({
    entryPoints: [configPath],
    platform: 'node',
    bundle: true,
    format: 'esm',
    sourcemap: 'inline',
    outfile: tmpConfigPath,
    plugins: [externalizeDeps, replaceImportMeta],
  });

  const tmpConfigPathUrl = pathToFileURL(tmpConfigPath);
  const configImport = await dynamicImport(tmpConfigPathUrl);
  const config = configImport.default as VeselConfig;
  unlinkSync(tmpConfigPath);

  return config;
}

export async function loadConfig() {
  const configPath = path.resolve('vesel.config.ts');
  const config = await loadConfigFromFile(configPath);
  return applyDefaultConfigValues(config ?? {});
}

export function defineVeselConfig(config: VeselUserConfig): VeselUserConfig {
  return config;
}
