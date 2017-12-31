import * as path from 'path';
import * as ts from 'typescript';

import { FailureReporter } from './../failure-reporter';
import { containsMatchingElement } from './../helpers/ng-html-ast.helpers';
import { getComponentSelector, isComponentClass } from './../helpers/ts-ast.helpers';
import { NgProgram } from './../ng-program';
import { NglintRule } from './../nglint-rule';

export class Rule extends NglintRule {
  apply(sourceFile: ts.SourceFile, ngProgram: NgProgram, failureReporter: FailureReporter) {
    if (!sourceFile.fileName.endsWith('.spec.ts')) {
      ts.forEachChild(sourceFile, function visit(node) {
        if (ts.isClassDeclaration(node) && isComponentClass(node)) {
          const componentName = node.name.getText();
          const selector = getComponentSelector(node);

          const componentUsedInRoutes = ngProgram.routedComponents.some(component => component.path === path.normalize(sourceFile.fileName) && component.name === componentName);
          const componentUsedInTemplate = selector && ngProgram.components.some(component => containsMatchingElement(component.templateAst, element => element.name === selector));

          if (!componentUsedInRoutes && !componentUsedInTemplate && selector !== 'app-root') {
            failureReporter.addFailure({ node: node.name, message: `The '${selector || componentName}' component is not used. Remove it.` });
          }
        }

        ts.forEachChild(node, visit);
      });
    }
  }
}
