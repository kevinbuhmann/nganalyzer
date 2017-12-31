import * as ts from 'typescript';

interface AbstractSourceFile {
  fileName: string;
  getLineAndCharacterOfPosition(position: number): ts.LineAndCharacter;
}

export interface Failure {
  sourceFile: AbstractSourceFile;
  start: number;
  end: number;
  message: string;
}

export class FailureReporter {
  private readonly failures: Failure[] = [];

  addFailureAtNode(node: ts.Node, message: string) {
    this.failures.push({ message, sourceFile: node.getSourceFile(), start: node.getStart(), end: node.getEnd() });
  }

  report() {
    if (this.failures.length > 0) {
      for (const failure of this.failures) {
        const sourceFile = failure.sourceFile;
        const { line, character } = sourceFile.getLineAndCharacterOfPosition(failure.start);

        console.log(`ERROR: ${sourceFile.fileName}[${line + 1},${character + 1}]: ${failure.message}`);
      }
    }

    return this.failures.length > 0;
  }
}
