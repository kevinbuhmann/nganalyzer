import { ngWalkerFactoryUtils } from 'codelyzer/angular/ngWalkerFactoryUtils';
import { getDecoratorName } from 'codelyzer/util/utils';
import * as ts from 'typescript';

const ngMetadataReader = ngWalkerFactoryUtils.defaultMetadataReader();

export function isComponentClass(node: ts.ClassDeclaration) {
  return node.decorators && node.decorators.some(decorator => getDecoratorName(decorator) === 'Component');
}

export function getComponentSelector(node: ts.ClassDeclaration) {
  return ngMetadataReader.read(node).selector;
}

export function getMatchingParent(node: ts.Node, predicate: (n: ts.Node) => boolean) {
  let parent = node ? node.parent : undefined;

  while (parent && !predicate(parent)) {
    parent = parent.parent;
  }

  return parent;
}

export function getParentOfType<T extends ts.Node>(node: ts.Node, predicate: (n: ts.Node) => n is T) {
  return getMatchingParent(node, predicate) as T;
}

export function getObjectLiteralElement(node: ts.ObjectLiteralExpression, propertyName: string) {
  return node.properties.find(property => property.name.getText() === propertyName);
}

export function getDefinition(node: ts.Node, program: ts.Program, languageService: ts.LanguageService) {
  const sourceFile = node.getSourceFile();
  const sourceFiles = program.getSourceFiles();

  const referencedSymbols = languageService.findReferences(sourceFile.fileName, node.getStart());

  let definition: ts.ReferenceEntry;

  if (referencedSymbols) {
    const isInImportDeclaration = (reference: ts.ReferenceEntry) => {
      const referenceSourceFile = sourceFiles.find(sf => sf.fileName === reference.fileName);

      return getParentOfType((ts as any).getTouchingToken(referenceSourceFile, reference.textSpan.start), ts.isImportDeclaration) !== undefined;
    };

    definition = referencedSymbols
      .map(referencedSymbol => referencedSymbol.references)
      .reduce((flat, current) => flat.concat(current), [])
      .filter(reference => reference.isDefinition)
      .filter(reference => !isInImportDeclaration(reference))[0];
  }

  return definition;
}
