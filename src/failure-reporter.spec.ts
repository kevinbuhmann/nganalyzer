import * as ts from 'typescript';

import { FailureReporter } from './failure-reporter';
import { parseTypescript } from './spec/spec.helpers';

describe('FailureReporter', () => {
  it('should report success correctly', () => {
    const failureReporter = new FailureReporter();

    const failureReport = failureReporter.report();

    expect(failureReport.length).toBe(0);
  });

  it('should report errors correctly', () => {
    const failureReporter = new FailureReporter();

    const source = `
      export class Person {
        name: string;
        birthdate: Date;
      }`;

    const sourceFile = parseTypescript(source);

    ts.forEachChild(sourceFile, function visit(node) {
      if (ts.isPropertyDeclaration(node)) {
        failureReporter.addFailureAtNode(node.name, `Property '${node.name.getText()}' not allowed.`);
      }

      ts.forEachChild(node, visit);
    });

    const failureReport = failureReporter.report();

    expect(failureReport.length).toBe(2);
    expect(failureReport[0]).toBe('ERROR: test-source.ts[3,9]: Property \'name\' not allowed.');
    expect(failureReport[1]).toBe('ERROR: test-source.ts[4,9]: Property \'birthdate\' not allowed.');
  });
});
