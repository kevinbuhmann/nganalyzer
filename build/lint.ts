import { execute } from './helpers/shell.helpers';
import { parseFlags } from './helpers/utility.helpers';

const defaultOptionsFn = () => ({
  fix: false
});

const options = parseFlags(process.argv.slice(2), defaultOptionsFn);

(async () => {
  await execute(`tslint --project ./tsconfig.lint.json ${options.fix ? '--fix' : ''}`);
})();
