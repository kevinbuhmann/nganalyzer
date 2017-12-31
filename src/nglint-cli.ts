#! /usr/bin/env node

import * as yargs from 'yargs';

import { getConfig } from './config';
import { nglint } from './nglint';

const version = require('./../package.json').version;

yargs.version(version);
yargs.option('project', { default: './tsconfig.json', description: 'The tsc project to use.' });
const args = yargs.argv;

const config = getConfig();

const failuresFound = nglint(config, args.project).report();

if (failuresFound) {
  process.exit(1);
}
