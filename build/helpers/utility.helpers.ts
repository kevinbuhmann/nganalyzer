import chalk from 'chalk';

export function bail(message: string) {
  console.error(chalk.red(`Error: ${message}`));
  process.exit(1);
}

export function bailIf(condition: boolean, message: string) {
  if (condition) {
    bail(message);
  }
}

export function parseFlags<T extends { [key: string]: boolean }>(args: string[], defaultOptionsFn: (args: T) => T) {
  for (const arg of args) {
    if (arg.startsWith('--') === false) {
      bail(`${arg} is an unrecognized flag.`);
    }
  }

  const argsMap = args
    .reduce<T>((options, arg) => {
      const key = arg.replace(/^--/, '').replace('no-', '');
      const value = arg.startsWith('--no-') === false;

      options[key] = value;
      return options;
     }, {} as any);

  const defaultOptions = defaultOptionsFn(argsMap);
  const validKeys = Object.keys(defaultOptions);

  for (const key of Object.keys(argsMap)) {
    if (validKeys.includes(key) === false) {
      const arg = argsMap[key] ? `--${key}` : `--no-${key}`;
      bail(`${arg} is an unrecognized flag.`);
    }
  }

  const result: T = { ...(defaultOptions as any), ...(argsMap as any) };
  return result;
}
