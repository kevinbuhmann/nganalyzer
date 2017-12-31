import * as tslint from 'tslint';

import { AbstractRule } from './abstract-rule';
import { Config } from './config';
import { FailureReporter } from './failure-reporter';
import { getNgProgram } from './ng-program';

export function nganalyzer(config: Config, project: string) {
  const failureReporter = new FailureReporter();

  const ngProgram = getNgProgram(tslint.Linter.createProgram(project));

  const rules = Object.keys(config.rules)
    .filter(ruleName => config.rules[ruleName] === true)
    .map(ruleName => new (require(`./rules/${ruleName}.rule`).Rule)() as AbstractRule);

  for (const rule of rules) {
    rule.apply(ngProgram, failureReporter);
  }

  return failureReporter;
}
