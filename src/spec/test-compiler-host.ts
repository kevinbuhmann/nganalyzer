import * as ts from 'typescript';

export interface Sources {
  [fileName: string ]: string;
}

export class TestCompilerHost implements ts.CompilerHost {
  constructor(private readonly sources: Sources) { }

  fileExists(fileName: string) {
    return this.sources[fileName] !== undefined;
  }

  readFile(fileName: string) {
    return this.sources[fileName];
  }

  getCanonicalFileName(fileName: string) {
    return fileName;
  }

  getCurrentDirectory() {
    return '.';
  }

  getDefaultLibFileName(_options: ts.CompilerOptions) {
    return 'lib';
  }

  getDirectories(_path: string) {
    return [] as string[];
  }

  getNewLine() {
    return '\n';
  }

  getSourceFile(fileName: string, languageVersion: ts.ScriptTarget, _onError?: (message: string) => void, _shouldCreateNewSourceFile?: boolean) {
    const source = this.readFile(fileName);
    return source ? ts.createSourceFile(fileName, source, languageVersion, true, ts.ScriptKind.TS) : undefined;
  }

  // tslint:disable-next-line:no-empty
  writeFile() { }

  useCaseSensitiveFileNames() {
    return true;
  }
}
