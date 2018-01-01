import * as ts from 'typescript';

import { parseTypescript } from './../spec/spec.helpers';
import { getComponentSelector, getObjectLiteralElement, getParentOfType, isComponentClass } from './ts-ast.helpers';

describe('isComponentClass', () => {
  it('should return true for component class', () => {
    const source = `
      @Component({})
      export class TestComponent { }`;

    const sourceFile = parseTypescript(source);
    const classNode = sourceFile.getChildAt(0).getChildAt(0) as ts.ClassDeclaration;

    expect(ts.isClassDeclaration(classNode)).toBe(true);
    expect(isComponentClass(classNode)).toBe(true);
  });

  it('should return false for non-decorated class', () => {
    const source = `
      export class TestComponent { }`;

    const sourceFile = parseTypescript(source);
    const classNode = sourceFile.getChildAt(0).getChildAt(0) as ts.ClassDeclaration;

    expect(ts.isClassDeclaration(classNode)).toBe(true);
    expect(isComponentClass(classNode)).toBe(false);
  });

  it('should return false for other decorated class', () => {
    const source = `
      @Injectable()
      export class TestComponent { }`;

    const sourceFile = parseTypescript(source);
    const classNode = sourceFile.getChildAt(0).getChildAt(0) as ts.ClassDeclaration;

    expect(ts.isClassDeclaration(classNode)).toBe(true);
    expect(isComponentClass(classNode)).toBe(false);
  });
});

describe('getComponentSelector', () => {
  it('should return the component selector', () => {
    const source = `
      @Component({
        selector: 'app-component'
      })
      export class TestComponent { }`;

    const sourceFile = parseTypescript(source);
    const classNode = sourceFile.getChildAt(0).getChildAt(0) as ts.ClassDeclaration;

    expect(ts.isClassDeclaration(classNode)).toBe(true);
    expect(getComponentSelector(classNode)).toBe('app-component');
  });

  it('should return undefined if no selector', () => {
    const source = `
      @Component({ })
      export class TestComponent { }`;

    const sourceFile = parseTypescript(source);
    const classNode = sourceFile.getChildAt(0).getChildAt(0) as ts.ClassDeclaration;

    expect(ts.isClassDeclaration(classNode)).toBe(true);

    expect(getComponentSelector(classNode)).toBeUndefined();
  });
});

describe('getParentOfType', () => {
  it('should return the matching parent or undefined', () => {
    const source = `
      export class Person {
        name: string;
        birthdate: Date;

        constructor(name: string) {
          this.name = name;
        }
      }`;

    const sourceFile = parseTypescript(source);
    const classNode = sourceFile.getChildAt(0).getChildAt(0) as ts.ClassDeclaration;
    const constructorNode = classNode.getChildAt(4).getChildAt(2) as ts.ConstructorDeclaration;
    const assignmentNode = constructorNode.getChildAt(4).getChildAt(1).getChildAt(0) as ts.ExpressionStatement;

    expect(ts.isClassDeclaration(classNode)).toBe(true);
    expect(ts.isConstructorDeclaration(constructorNode)).toBe(true);
    expect(ts.isExpressionStatement(assignmentNode)).toBe(true);

    expect(getParentOfType(assignmentNode, ts.isClassDeclaration)).toBe(classNode);
    expect(getParentOfType(constructorNode, ts.isClassDeclaration)).toBe(classNode);

    expect(getParentOfType(undefined, ts.isNamespaceExportDeclaration)).toBe(undefined);
    expect(getParentOfType(sourceFile, ts.isNamespaceExportDeclaration)).toBe(undefined);
    expect(getParentOfType(constructorNode, ts.isNamespaceExportDeclaration)).toBe(undefined);
  });
});

describe('getObjectLiteralElement', () => {
  it('should return the correct element or undefined', () => {
    const source = `
      ({
        name: 'John Smith',
        age: 25,
        'address': '123 Main St.',
        5: '5',
        [infoProp]: 'info',
        [getInfoProp()]: 'info'
      })`;

    const sourceFile = parseTypescript(source);
    const objectLiteralNode = sourceFile.getChildAt(0).getChildAt(0).getChildAt(0).getChildAt(1) as ts.ObjectLiteralExpression;

    expect(ts.isObjectLiteralExpression(objectLiteralNode)).toBe(true);

    expect(getObjectLiteralElement(objectLiteralNode, 'name')).toBe(objectLiteralNode.properties[0]);
    expect(getObjectLiteralElement(objectLiteralNode, 'age')).toBe(objectLiteralNode.properties[1]);
    expect(getObjectLiteralElement(objectLiteralNode, 'address')).toBe(objectLiteralNode.properties[2]);
    expect(getObjectLiteralElement(objectLiteralNode, '5')).toBe(objectLiteralNode.properties[3]);

    expect(getObjectLiteralElement(objectLiteralNode, 'city')).toBe(undefined);
    expect(getObjectLiteralElement(objectLiteralNode, 'state')).toBe(undefined);
    expect(getObjectLiteralElement(objectLiteralNode, 'infoProp')).toBe(undefined);
    expect(getObjectLiteralElement(objectLiteralNode, '[infoProp]')).toBe(undefined);
    expect(getObjectLiteralElement(objectLiteralNode, 'getInfoProp')).toBe(undefined);
    expect(getObjectLiteralElement(objectLiteralNode, 'getInfoProp()')).toBe(undefined);
    expect(getObjectLiteralElement(objectLiteralNode, '[getInfoProp()]')).toBe(undefined);
  });
});
