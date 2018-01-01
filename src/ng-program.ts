import * as ngc from '@angular/compiler';
import { ComponentMetadata } from 'codelyzer/angular/metadata';
import { ngWalkerFactoryUtils } from 'codelyzer/angular/ngWalkerFactoryUtils';
import * as ts from 'typescript';

import { dereferenceLiterals, getDefinition, getObjectLiteralElement, isComponentClass } from './helpers/ts-ast.helpers';
import { ProgramLanguageServiceHost } from './program-language-service-host';

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

export function getNgProgram(program: ts.Program) {
  const languageServiceHost = new ProgramLanguageServiceHost(program);
  const languageService = ts.createLanguageService(languageServiceHost, ts.createDocumentRegistry());

  const components = getAllComponents(program);

  const ngProgram: NgProgram = {
    components,
    routedComponents: getAllRoutedComponents(program, languageService, components)
  };

  return ngProgram;
}

function getAllComponents(program: ts.Program) {
  const components: Component[] = [];

  for (const sourceFile of program.getSourceFiles()) {
    ts.forEachChild(sourceFile, function visit(node) {
      if (ts.isClassDeclaration(node) && isComponentClass(node)) {
        const componentMetadata = ngMetadataReader.read(node) as ComponentMetadata;

        const componentName = node.name.getText();
        const componentPath = sourceFile.fileName;
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

function getAllRoutedComponents(program: ts.Program, languageService: ts.LanguageService, components: Component[]) {
  const routedComponents: Component[] = [];

  for (const sourceFile of program.getSourceFiles()) {
    ts.forEachChild(sourceFile, function visit(node) {
      if (ts.isCallExpression(node) && ['RouterModule.forRoot', 'RouterModule.forChild'].includes(node.expression.getText())) {
        routedComponents.push(...getRoutedComponents(node.arguments[0], program, languageService, components));
      }

      ts.forEachChild(node, visit);
    });
  }

  return routedComponents
    .filter((value, index, self) => self.indexOf(value) === index);

}

function getRoutedComponents(routes: ts.Node, program: ts.Program, languageService: ts.LanguageService, components: Component[]) {
  const routedComponents: Component[] = [];

  const deferencedRoutes = dereferenceLiterals(routes, program, languageService);

  ts.forEachChild(deferencedRoutes, function visit(node) {
    if (ts.isObjectLiteralExpression(node)) {
      const componentElement = getObjectLiteralElement(node, 'component');

      if (componentElement && ts.isPropertyAssignment(componentElement)) {
        const componentName = componentElement.initializer.getText();
        const componentDefinition = getDefinition(componentElement.initializer, program, languageService);
        const componentPath = componentDefinition.fileName;

        routedComponents.push(components.find(component => component.name === componentName && component.path === componentPath));
      }
    }

    ts.forEachChild(node, visit);
  });

  return routedComponents;
}
