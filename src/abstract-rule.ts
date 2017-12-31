import * as ts from 'typescript';

import { FailureReporter } from './failure-reporter';
import { NgProgram } from './ng-program';

export abstract class AbstractRule {
  abstract apply(sourceFile: ts.SourceFile, ngProgram: NgProgram, failureReporter: FailureReporter): void;
}
