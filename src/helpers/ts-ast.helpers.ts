import { ngWalkerFactoryUtils } from 'codelyzer/angular/ngWalkerFactoryUtils';
import { getDecoratorName } from 'codelyzer/util/utils';
import * as ts from 'typescript';

const ngMetadataReader = ngWalkerFactoryUtils.defaultMetadataReader();

export function isComponentClass(node: ts.ClassDeclaration) {
  return node.decorators ? node.decorators.some(decorator => getDecoratorName(decorator) === 'Component') : false;
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
  return node.properties
    .filter(property => property.name !== undefined)
    .find(property => (ts.isStringLiteral(property.name) || ts.isIdentifier(property.name) || ts.isNumericLiteral(property.name)) && property.name.text === propertyName);
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

export function dereferenceLiterals(sourceNode: ts.Node, program: ts.Program, languageService: ts.LanguageService) {
  return ts.visitNode(sourceNode, function visit(node): ts.Node {
    const definition = ts.isIdentifier(node) ? getDefinition(node, program, languageService) : undefined;
    const definitionSourceFile = definition ? program.getSourceFile(definition.fileName) : undefined;
    const identifier = definition ? (ts as any).getTouchingToken(definitionSourceFile, definition.textSpan.start) : undefined;

    const resultNode = identifier && ts.isIdentifier(identifier) && ts.isVariableDeclaration(identifier.parent) && isLiteral(identifier.parent.initializer) ?
      identifier.parent.initializer : node;

    return ts.visitEachChild(resultNode, visit, undefined);
  });
}

function isLiteral(node: ts.Node) {
  return ts.isNumericLiteral(node)
    || ts.isStringLiteral(node)
    || ts.isRegularExpressionLiteral(node)
    || ts.isNoSubstitutionTemplateLiteral(node)
    || ts.isArrayLiteralExpression(node)
    || ts.isObjectLiteralExpression(node);
}
