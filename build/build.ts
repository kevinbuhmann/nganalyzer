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
    await execute('rimraf ./dist ./dist-spec ./coverage');
  }

  if (options.lint) {
    await execute('tslint --project ./tsconfig.lint.json');
  }

  await execute(`tsc --project ./tsconfig.json ${options.watch ? '--watch' : ''}`);

  if (options.test) {
    await execute(`tsc --project ./tsconfig.spec.json`);
    await execute('istanbul cover node_modules/jasmine/bin/jasmine.js --print none -- --config=jasmine.json');
    await execute('remap-istanbul -i coverage/coverage.json -o coverage/coverage.json -t json');
    await execute('istanbul report -t lcov');
    await execute('istanbul report -t text-summary');
    await execute('istanbul check-coverage --statements 85 --branches 85 --functions 85 --branches 85 --lines 85');
  }
})();
