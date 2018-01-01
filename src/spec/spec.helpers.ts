import * as ngc from '@angular/compiler';
import * as ts from 'typescript';

import { FailureReporter } from './../failure-reporter';
import { getNgProgram } from './../ng-program';
import { loadRule } from './../nganalyzer';
import { Sources, TestCompilerHost } from './test-compiler-host';

const htmlParser = new ngc.HtmlParser();

export function parseTypescript(source: string) {
  return ts.createSourceFile('test-source.ts', source, ts.ScriptTarget.ES5, true, ts.ScriptKind.TS);
}

export function parseTemplate(source: string) {
  return htmlParser.parse(source, undefined);
}

export function getTypescriptProgram(sources: Sources) {
  return ts.createProgram(Object.keys(sources), {}, new TestCompilerHost(sources));
}

export function expectRuleSuccess(ruleName: string, sources: Sources) {
  expect(applyRule(ruleName, sources)).toEqual([]);
}

export function expectRuleFailures(ruleName: string, sources: Sources) {
  return expect(applyRule(ruleName, sources));
}

function applyRule(ruleName: string, sources: Sources) {
  const rule = loadRule(ruleName);

  const program = getTypescriptProgram(sources);
  const ngProgram = getNgProgram(program);

  const failureReporter = new FailureReporter();
  rule.apply(ngProgram, failureReporter);

  return failureReporter.report();
}
