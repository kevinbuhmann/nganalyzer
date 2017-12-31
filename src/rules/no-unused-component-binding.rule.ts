import * as ngc from '@angular/compiler';
import { getDecoratorName } from 'codelyzer/util/utils';
import * as ts from 'typescript';

import { AbstractRule } from './../abstract-rule';
import { FailureReporter } from './../failure-reporter';
import { containsMatchingElement } from './../helpers/ng-html-ast.helpers';
import { getComponentSelector, isComponentClass } from './../helpers/ts-ast.helpers';
import { NgProgram } from './../ng-program';

export class Rule extends AbstractRule {
  static FAILURE_STRING_FACTORY(selector: string, binding: string, bindingType: 'input' | 'output') {
    return `The '${binding}' ${bindingType} on the '${selector}' component is not used. Remove it.`;
  }

  apply(sourceFile: ts.SourceFile, ngProgram: NgProgram, failureReporter: FailureReporter) {
    ts.forEachChild(sourceFile, function visit(node) {
      if (ts.isPropertyDeclaration(node) && ts.isClassDeclaration(node.parent) && isComponentClass(node.parent)) {
        const inputDecorator = node.decorators && node.decorators.find(decorator => getDecoratorName(decorator) === 'Input');
        const outputDecorator = node.decorators && node.decorators.find(decorator => getDecoratorName(decorator) === 'Output');

        if (inputDecorator || outputDecorator) {
          const selector = getComponentSelector(node.parent);

          const decorator = inputDecorator || outputDecorator;
          const decoratorArgument = ts.isCallExpression(decorator.expression) ? decorator.expression.arguments[0] : undefined;
          const binding = decoratorArgument && ts.isStringLiteral(decoratorArgument) ? decoratorArgument.text : node.name.getText();

          const attrNames = inputDecorator ? [binding, `[${binding}]`, `[(${binding})]`] : [`(${binding})`, `[(${binding.replace(/Change$/, '')})]`];
          const elementUsesBinding = (element: ngc.Element) => element.name === selector && element.attrs.some(attr => attrNames.includes(attr.name));

          if (!ngProgram.components.some(component => containsMatchingElement(component.templateAst, elementUsesBinding))) {
            const bindingType = inputDecorator ? 'input' : 'output';
            failureReporter.addFailureAtNode(node.name, Rule.FAILURE_STRING_FACTORY(selector, binding, bindingType));
          }
        }
      }

      ts.forEachChild(node, visit);
    });
  }
}
