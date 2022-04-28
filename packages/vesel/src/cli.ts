#!/usr/bin/env node

import cac from 'cac';
import chalk from 'chalk';
import { buildMain, buildRenderer } from './build';
import { loadConfig } from './config';
import { watchMain, watchRenderer } from './dev';
import { previewMain, previewRenderer } from './preview';

const cli = cac('vesel');

cli
  .command('[root]', 'run app in development mode')
  .alias('dev')
  .action(async () => {
    console.log(chalk.green('Loading config...'));
    const config = await loadConfig();

    console.log(chalk.green('Starting app in dev mode...'));
    watchMain(config);
    watchRenderer(config);
  });

cli.command('build', 'build app for production').action(async () => {
  console.log(chalk.green('Loading config...'));
  const config = await loadConfig();

  console.log(chalk.green('Building app...'));
  await buildMain(config);

  console.log(chalk.green('Building renderer...'));
  await buildRenderer(config);
});

cli.command('preview', 'preview production app').action(async () => {
  console.log(chalk.green('Loading config...'));
  const config = await loadConfig();

  console.log(chalk.green('Starting app...'));
  await previewMain(config);

  console.log(chalk.green('Starting renderer...'));
  await previewRenderer(config);
});

cli.help();

cli.version(require('../package.json').version);

cli.parse();
