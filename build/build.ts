import { execute } from './helpers/shell.helpers';
import { parseFlags } from './helpers/utility.helpers';

interface Options {
  clean: boolean;
  lint: boolean;
  watch: boolean;
  test: boolean;
}

const defaultOptionsFn = (args: Options) => ({
  clean: true,
  lint: !args.watch,
  watch: false
});

const options = parseFlags(process.argv.slice(2), defaultOptionsFn);

(async () => {
  if (options.clean) {
    await execute('rimraf ./dist');
  }

  if (options.lint) {
    await execute('tslint --project ./tsconfig.lint.json');
  }

  await execute(`tsc --project ./tsconfig.json ${options.watch ? '--watch' : ''}`);
})();
