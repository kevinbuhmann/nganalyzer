import * as ngc from '@angular/compiler';
import * as ts from 'typescript';

import { AbstractRule } from './../abstract-rule';
import { FailureReporter } from './../failure-reporter';
import { getNgProgram } from './../ng-program';
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

export function expectRuleSuccess(Rule: new () => AbstractRule, sources: Sources) {
  expect(runRule(Rule, sources)).toEqual([]);
}

export function expectRuleFailures(Rule: new () => AbstractRule, sources: Sources) {
  return expect(runRule(Rule, sources));
}

function runRule(Rule: new () => AbstractRule, sources: Sources) {
  const rule = new Rule();

  const program = getTypescriptProgram(sources);
  const ngProgram = getNgProgram(program);

  const failureReporter = new FailureReporter();
  rule.apply(ngProgram, failureReporter);

  return failureReporter.report();
}
