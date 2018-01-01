#! /usr/bin/env node

import * as yargs from 'yargs';

import { getConfig } from './config';
import { nganalyzer } from './nganalyzer';

const version = require('./../package.json').version;

yargs.version(version);
yargs.option('project', { default: './tsconfig.json', description: 'The tsc project to use.' });
const args = yargs.argv;

const config = getConfig();

const failureReport = nganalyzer(config, args.project).report();

if (failureReport.length > 0) {
  console.log(failureReport.join('\n'));
  process.exit(1);
}
