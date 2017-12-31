import * as ngc from '@angular/compiler';
import { getDecoratorName } from 'codelyzer/util/utils';
import * as ts from 'typescript';

import { AbstractRule } from './../abstract-rule';
import { FailureReporter } from './../failure-reporter';
import { containsMatchingElement } from './../helpers/ng-html-ast.helpers';
import { NgProgram } from './../ng-program';

export class Rule extends AbstractRule {
  static FAILURE_STRING_FACTORY(selector: string, binding: string, bindingType: 'input' | 'output') {
    return `The '${binding}' ${bindingType} on the '${selector}' component is not used. Remove it.`;
  }

  apply(ngProgram: NgProgram, failureReporter: FailureReporter) {
    for (const component of ngProgram.components) {
      ts.forEachChild(component.node, function visit(node) {
        if (ts.isPropertyDeclaration(node)) {
          const inputDecorator = node.decorators && node.decorators.find(decorator => getDecoratorName(decorator) === 'Input');
          const outputDecorator = node.decorators && node.decorators.find(decorator => getDecoratorName(decorator) === 'Output');

          if (inputDecorator || outputDecorator) {
            const decorator = inputDecorator || outputDecorator;
            const decoratorArgument = ts.isCallExpression(decorator.expression) ? decorator.expression.arguments[0] : undefined;
            const binding = decoratorArgument && ts.isStringLiteral(decoratorArgument) ? decoratorArgument.text : node.name.getText();

            const attrNames = inputDecorator ? [binding, `[${binding}]`, `[(${binding})]`] : [`(${binding})`, `[(${binding.replace(/Change$/, '')})]`];
            const elementUsesBinding = (element: ngc.Element) => element.name === component.selector && element.attrs.some(attr => attrNames.includes(attr.name));

            if (!ngProgram.components.some(({ templateAst }) => containsMatchingElement(templateAst, elementUsesBinding))) {
              const bindingType = inputDecorator ? 'input' : 'output';
              failureReporter.addFailureAtNode(node.name, Rule.FAILURE_STRING_FACTORY(component.selector, binding, bindingType));
            }
          }
        }

        ts.forEachChild(node, visit);
      });
    }
  }
}
