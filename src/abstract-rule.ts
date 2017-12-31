import { FailureReporter } from './failure-reporter';
import { NgProgram } from './ng-program';

export abstract class AbstractRule {
  abstract apply(ngProgram: NgProgram, failureReporter: FailureReporter): void;
}
