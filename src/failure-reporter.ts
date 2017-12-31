import * as ts from 'typescript';

export interface Failure {
  node: ts.Node;
  message: string;
}

export class FailureReporter {
  private readonly failures: Failure[] = [];

  addFailureAtNode(node: ts.Node, message: string) {
    this.failures.push({ node, message });
  }

  report() {
    if (this.failures.length > 0) {
      for (const failure of this.failures) {
        const sourceFile = failure.node.getSourceFile();
        const { line, character } = sourceFile.getLineAndCharacterOfPosition(failure.node.getStart());

        console.log(`ERROR: ${sourceFile.fileName}[${line + 1},${character + 1}]: ${failure.message}`);
      }
    }

    return this.failures.length > 0;
  }
}
