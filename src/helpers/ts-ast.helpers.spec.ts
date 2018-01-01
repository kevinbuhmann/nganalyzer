import * as ts from 'typescript';

import { ProgramLanguageServiceHost } from './../program-language-service-host';
import { getTypescriptProgram, parseTypescript } from './../spec/spec.helpers';
import { dereferenceLiterals, getComponentSelector, getObjectLiteralElement, getParentOfType, isComponentClass } from './ts-ast.helpers';

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

describe('dereferenceLiterals', () => {
  it('should dereference all references to literal values', () => {
    const fileASource = `
      export const hello1 = \'hello world\';
      export const hello2 = { hello: hello1 };
      export const hello3 = [ hello1 ];`;

    const fileBSource = `
      import { hello1, hello2, hello3 } from './file-a';

      const hellos = [ hello1, hello2, hello3 ]`;

    const sources = {
      'file-a.ts': fileASource,
      'file-b.ts': fileBSource
    };

    const program = getTypescriptProgram(sources);
    const languageServiceHost = new ProgramLanguageServiceHost(program);
    const languageService = ts.createLanguageService(languageServiceHost, ts.createDocumentRegistry());

    const fileBSourceFile = program.getSourceFile('file-b.ts');
    const hellosIdentifier = fileBSourceFile.getChildAt(0).getChildAt(1).getChildAt(0).getChildAt(1).getChildAt(0).getChildAt(0) as ts.Identifier;

    const dereferencedNode = dereferenceLiterals(hellosIdentifier, program, languageService) as ts.ArrayLiteralExpression;

    expect(ts.isArrayLiteralExpression(dereferencedNode)).toBe(true);
    expect(dereferencedNode.elements.length).toBe(3);
    const [ element1, element2, element3 ] = Array.from(dereferencedNode.elements) as [ts.StringLiteral, ts.ObjectLiteralExpression, ts.ArrayLiteralExpression];

    expect(ts.isStringLiteral(element1)).toBe(true);
    expect(element1.text).toBe('hello world');

    expect(ts.isObjectLiteralExpression(element2)).toBe(true);
    expect(element2.properties.length).toBe(1);
    const [ element2_property1 ] = Array.from(element2.properties) as [ts.PropertyAssignment];
    expect(ts.isPropertyAssignment(element2_property1)).toBe(true);
    expect(ts.isIdentifier(element2_property1.name)).toBe(true);
    expect(ts.isStringLiteral(element2_property1.initializer)).toBe(true);
    expect((element2_property1.name as ts.Identifier).text).toBe('hello');
    expect((element2_property1.initializer as ts.StringLiteral).text).toBe('hello world');

    expect(ts.isArrayLiteralExpression(element3)).toBe(true);
    expect(element3.elements.length).toBe(1);
    const [ element3_element1 ] = Array.from(element3.elements) as [ts.StringLiteral];
    expect(ts.isStringLiteral(element3_element1)).toBe(true);
    expect(element3_element1.text).toBe('hello world');
  });
});
