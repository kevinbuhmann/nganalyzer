import * as ngc from '@angular/compiler';
import { ComponentMetadata } from 'codelyzer/angular/metadata';
import { ngWalkerFactoryUtils } from 'codelyzer/angular/ngWalkerFactoryUtils';
import * as path from 'path';
import * as ts from 'typescript';

import { getDefinition, getObjectLiteralElement, getParentOfType, isComponentClass } from './helpers/ts-ast.helpers';

const ngMetadataReader = ngWalkerFactoryUtils.defaultMetadataReader();
const htmlParser = new ngc.HtmlParser();

export interface Component {
  path: string;
  name: string;
  node: ts.ClassDeclaration;
  selector: string;
  template: string;
  templateAst: ngc.ParseTreeResult;
}

export interface NgProgram {
  components: Component[];
  routedComponents: Component[];
}

export function getNgProgram(program: ts.Program, languageService: ts.LanguageService) {
  const components = getAllComponents(program);

  const ngProgram: NgProgram = {
    components,
    routedComponents: getAllRoutedComponents(program, languageService, components)
  };

  return ngProgram;
}

export function getAllComponents(program: ts.Program) {
  const components: Component[] = [];

  for (const sourceFile of program.getSourceFiles()) {
    ts.forEachChild(sourceFile, function visit(node) {
      if (ts.isClassDeclaration(node) && isComponentClass(node)) {
        const componentMetadata = ngMetadataReader.read(node) as ComponentMetadata;

        const componentName = node.name.getText();
        const componentPath = path.normalize(sourceFile.fileName);
        const selector = componentMetadata.selector;
        const template = componentMetadata.template.template.source;
        const templateAst = htmlParser.parse(template, undefined);

        components.push({ name: componentName, path: componentPath, node, selector, template, templateAst });
      }

      ts.forEachChild(node, visit);
    });
  }

  return components;
}

export function getAllRoutedComponents(program: ts.Program, languageService: ts.LanguageService, components: Component[]) {
  const routedComponents: Component[] = [];

  for (const sourceFile of program.getSourceFiles()) {
    ts.forEachChild(sourceFile, function visit(node) {
      if (ts.isCallExpression(node) && ['RouterModule.forRoot', 'RouterModule.forChild'].includes(node.expression.getText())) {
        routedComponents.push(...getRoutedComponents(node.arguments[0], languageService, components));
      }

      ts.forEachChild(node, visit);
    });
  }

  return routedComponents
    .filter((value, index, self) => self.indexOf(value) === index);

}

function getRoutedComponents(node: ts.Node, languageService: ts.LanguageService, components: Component[]) {
  const routedComponents: Component[] = [];

  const sourceFile = node.getSourceFile();

  if (ts.isObjectLiteralExpression(node)) {
    const componentElement = getObjectLiteralElement(node, 'component');
    const childrenElement = getObjectLiteralElement(node, 'children');

    if (componentElement && ts.isPropertyAssignment(componentElement)) {

      const definition = getDefinition(componentElement.initializer, languageService);
      const definitionIdentifier: ts.Identifier = (ts as any).getTouchingToken(sourceFile, definition.textSpan.start);
      const importDeclaration = getParentOfType(definitionIdentifier, ts.isImportDeclaration);
      const importSource = (importDeclaration.moduleSpecifier as ts.StringLiteral).text;

      const componentName = componentElement.initializer.getText();
      const componentPath = `${path.resolve(path.dirname(sourceFile.fileName), importSource)}.ts`;
      const component = components.find(c => c.name === componentName && c.path === componentPath);

      routedComponents.push(component);
    }

    if (childrenElement && ts.isPropertyAssignment(childrenElement)) {
      routedComponents.push(...getRoutedComponents(childrenElement.initializer, languageService, components));
    }
  } else if (ts.isArrayLiteralExpression(node)) {
    for (const element of node.elements) {
      routedComponents.push(...getRoutedComponents(element, languageService, components));
    }
  } else {
    const definition = getDefinition(node, languageService);

    if (definition) {
      const routesIdentifer: ts.Identifier = (ts as any).getTouchingToken(sourceFile, definition.textSpan.start);
      const routesDeclaration = routesIdentifer.parent as ts.VariableDeclaration;

      routedComponents.push(...getRoutedComponents(routesDeclaration.initializer, languageService, components));
    }
  }

  return routedComponents;
}
