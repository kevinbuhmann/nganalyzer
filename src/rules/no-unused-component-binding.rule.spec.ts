import { expectRuleFailures, expectRuleSuccess } from './../spec/spec.helpers';

describe('no-unused-component-binding', () => {
  it('should pass when no failures', () => {
    const appComponentCode = `
      @Component({
        selector: 'app-root',
        template: '<div><app-home [info]="info" (update)="update(@event)"></app-home></div>'
      })
      export class AppComponent { }`;

    const homeComponentCode = `
      @Component({
        selector: 'app-home',
        template: '<div>app-home</div>'
      })
      export class HomeComponent {
        @Input() info: string;
        @Output() update = new EventEmitter<void>();
      }`;

    const sources = {
      'app.component.ts': appComponentCode,
      'home.component.ts': homeComponentCode
    };

    expectRuleSuccess('no-unused-component-binding', sources);
  });

  it('should report unused input', () => {
    const appComponentCode = `
      @Component({
        selector: 'app-root',
        template: '<div><app-home (update)="update(@event)"></app-home></div>'
      })
      export class AppComponent { }`;

    const homeComponentCode = `
      @Component({
        selector: 'app-home',
        template: '<div>app-home</div>'
      })
      export class HomeComponent {
        @Input() info: string;
        @Output() update = new EventEmitter<void>();
      }`;

    const sources = {
      'app.component.ts': appComponentCode,
      'home.component.ts': homeComponentCode
    };

    const failures = [
      'ERROR: home.component.ts[7,18]: The \'info\' input on the \'app-home\' component is not used. Remove it.'
    ];

    expectRuleFailures('no-unused-component-binding', sources).toEqual(failures);
  });

  it('should report unused output', () => {
    const appComponentCode = `
      @Component({
        selector: 'app-root',
        template: '<div><app-home [info]="info"></app-home></div>'
      })
      export class AppComponent { }`;

    const homeComponentCode = `
      @Component({
        selector: 'app-home',
        template: '<div>app-home</div>'
      })
      export class HomeComponent {
        @Input() info: string;
        @Output() update = new EventEmitter<void>();
      }`;

    const sources = {
      'app.component.ts': appComponentCode,
      'home.component.ts': homeComponentCode
    };

    const failures = [
      'ERROR: home.component.ts[8,19]: The \'update\' output on the \'app-home\' component is not used. Remove it.'
    ];

    expectRuleFailures('no-unused-component-binding', sources).toEqual(failures);
  });

  it('should report unused input and output', () => {
    const appComponentCode = `
      @Component({
        selector: 'app-root',
        template: '<div><app-home></app-home></div>'
      })
      export class AppComponent { }`;

    const homeComponentCode = `
      @Component({
        selector: 'app-home',
        template: '<div>app-home</div>'
      })
      export class HomeComponent {
        @Input() info: string;
        @Output() update = new EventEmitter<void>();
      }`;

    const sources = {
      'app.component.ts': appComponentCode,
      'home.component.ts': homeComponentCode
    };

    const failures = [
      'ERROR: home.component.ts[7,18]: The \'info\' input on the \'app-home\' component is not used. Remove it.',
      'ERROR: home.component.ts[8,19]: The \'update\' output on the \'app-home\' component is not used. Remove it.'
    ];

    expectRuleFailures('no-unused-component-binding', sources).toEqual(failures);
  });

  it('should report unused aliased input and output', () => {
    const appComponentCode = `
      @Component({
        selector: 'app-root',
        template: '<div><app-home></app-home></div>'
      })
      export class AppComponent { }`;

    const homeComponentCode = `
      @Component({
        selector: 'app-home',
        template: '<div>app-home</div>'
      })
      export class HomeComponent {
        @Input('info') _info: string;
        @Output('update') _update = new EventEmitter<void>();
      }`;

    const sources = {
      'app.component.ts': appComponentCode,
      'home.component.ts': homeComponentCode
    };

    const failures = [
      'ERROR: home.component.ts[7,24]: The \'info\' input on the \'app-home\' component is not used. Remove it.',
      'ERROR: home.component.ts[8,27]: The \'update\' output on the \'app-home\' component is not used. Remove it.'
    ];

    expectRuleFailures('no-unused-component-binding', sources).toEqual(failures);
  });

  it('should not report used aliased input and output', () => {
    const appComponentCode = `
      @Component({
        selector: 'app-root',
        template: '<div><app-home [info]="info" (update)="update(@event)"></app-home></div>'
      })
      export class AppComponent { }`;

    const homeComponentCode = `
      @Component({
        selector: 'app-home',
        template: '<div>app-home</div>'
      })
      export class HomeComponent {
        @Input('info') _info: string;
        @Output('update') _update = new EventEmitter<void>();
      }`;

    const sources = {
      'app.component.ts': appComponentCode,
      'home.component.ts': homeComponentCode
    };

    expectRuleSuccess('no-unused-component-binding', sources);
  });

  it('should not report change output used in two-way binding', () => {
    const appComponentCode = `
      @Component({
        selector: 'app-root',
        template: '<div><app-home [(info)]="info"></app-home></div>'
      })
      export class AppComponent { }`;

    const homeComponentCode = `
      @Component({
        selector: 'app-home',
        template: '<div>app-home</div>'
      })
      export class HomeComponent {
        @Input() info: string;
        @Output() infoChange = new EventEmitter<string>();
      }`;

    const sources = {
      'app.component.ts': appComponentCode,
      'home.component.ts': homeComponentCode
    };

    expectRuleSuccess('no-unused-component-binding', sources);
  });
});
