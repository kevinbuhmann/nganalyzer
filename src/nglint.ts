import * as tslint from 'tslint';
import * as ts from 'typescript';

import { Config } from './config';
import { FailureReporter } from './failure-reporter';
import { getNgProgram } from './ng-program';
import { NglintRule } from './nglint-rule';
import { ProgramLanguageServiceHost } from './program-language-service-host';

export function nglint(config: Config, project: string) {
  const failureReporter = new FailureReporter();

  const program = tslint.Linter.createProgram(project);

  const languageServiceHost = new ProgramLanguageServiceHost(program);
  const languageService = ts.createLanguageService(languageServiceHost, ts.createDocumentRegistry());

  const ngProgram = getNgProgram(program, languageService);

  const rules = Object.keys(config.rules)
    .filter(ruleName => config.rules[ruleName] === true)
    .map(ruleName => new (require(`./rules/${ruleName}.rule`).Rule)() as NglintRule);

  for (const sourceFile of program.getSourceFiles()) {
    for (const rule of rules) {
      rule.apply(sourceFile, ngProgram, failureReporter);
    }
  }

  return failureReporter;
}
