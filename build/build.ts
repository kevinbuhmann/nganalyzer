import { execute } from './helpers/shell.helpers';
import { bailIf, parseFlags } from './helpers/utility.helpers';

interface Options {
  clean: boolean;
  lint: boolean;
  watch: boolean;
  test: boolean;
}

const defaultOptionsFn = (args: Options) => ({
  clean: true,
  lint: !args.watch,
  watch: false,
  test: !args.watch
});

const options = parseFlags(process.argv.slice(2), defaultOptionsFn);

bailIf(options.watch && options.test, '--watch and --test are mutually exclusive.');

(async () => {
  if (options.clean) {
    await execute('rimraf ./dist');
  }

  if (options.lint) {
    await execute('tslint --project ./tsconfig.lint.json');
  }

  await execute(`tsc --project ./tsconfig.json ${options.watch ? '--watch' : ''}`);

  if (options.test) {
    await execute('nyc jasmine-ts \"./src/**/*.spec.ts\"');
    await execute('nyc check-coverage --lines 90 --functions 85 --branches 80');
  }
})();
