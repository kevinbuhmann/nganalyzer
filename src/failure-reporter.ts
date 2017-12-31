import * as path from 'path';
import * as ts from 'typescript';

export interface Failure {
  node: ts.Node;
  message: string;
}

export class FailureReporter {
  private readonly failures: Failure[] = [];

  addFailure(failure: Failure) {
    this.failures.push(failure);
  }

  report() {
    if (this.failures.length > 0) {
      for (const failure of this.failures) {
        const sourceFile = failure.node.getSourceFile();
        const relativePath = `.${path.sep}${path.relative('.', sourceFile.fileName)}`;
        const { line, character } = sourceFile.getLineAndCharacterOfPosition(failure.node.getStart());

        console.log(`${relativePath} (${line + 1},${character + 1}): ${failure.message}`);
      }
    }

    return this.failures.length > 0;
  }
}
