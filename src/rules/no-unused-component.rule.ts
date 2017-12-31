import { AbstractRule } from './../abstract-rule';
import { FailureReporter } from './../failure-reporter';
import { containsMatchingElement } from './../helpers/ng-html-ast.helpers';
import { NgProgram } from './../ng-program';

export class Rule extends AbstractRule {
  static FAILURE_STRING_FACTORY(component: string) {
    return `The '${component}' component is not used. Remove it.`;
  }

  apply(ngProgram: NgProgram, failureReporter: FailureReporter) {
    const nonSpecComponents = ngProgram.components
      .filter(component => !component.path.endsWith('.spec.ts'));

    for (const component of nonSpecComponents) {
      const componentUsedInRoutes = ngProgram.routedComponents.includes(component);
      const componentUsedInTemplate = ngProgram.components.some(({ templateAst }) => containsMatchingElement(templateAst, element => element.name === component.selector));

      if (!componentUsedInRoutes && !componentUsedInTemplate && component.selector !== 'app-root') {
        failureReporter.addFailureAtNode(component.node.name, Rule.FAILURE_STRING_FACTORY(component.selector || component.name));
      }
    }
  }
}
