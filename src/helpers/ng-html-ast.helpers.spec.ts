import { parseTemplate } from './../spec/spec.helpers';
import { containsMatchingElement } from './ng-html-ast.helpers';

describe('containsMatchingElement', () => {
  it('should work', () => {
    const source = `
      <div>
        <div>
          <app-component [value]="value"></app-component>
        </div>
      </div>`;

    const templateAst = parseTemplate(source);

    expect(containsMatchingElement(templateAst, element => element.name === 'app-component')).toBe(true);
    expect(containsMatchingElement(templateAst, element => element.name === 'app-component' && element.attrs.some(attr => attr.name === '[value]'))).toBe(true);

    expect(containsMatchingElement(templateAst, element => element.name === 'app-something')).toBe(false);
    expect(containsMatchingElement(templateAst, element => element.name === 'app-component' && element.attrs.some(attr => attr.name === '[input]'))).toBe(false);
  });
});
