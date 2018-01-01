import { expectRuleFailures, expectRuleSuccess } from './../spec/spec.helpers';

describe('no-unused-component', () => {
  it('should pass when no failures', () => {
    const appComponentCode = `
      @Component({
        selector: 'app-root',
        template: '<div>app-component</div>'
      })
      export class AppComponent { }`;

    const homeComponentCode = `
      @Component({
        selector: 'app-home',
        template: '<div>app-home</div>'
      })
      export class HomeComponent { }`;

    const appRoutingModuleCode = `
      import { AboutComponent } from './about.component';
      import { HomeComponent } from './home.component';

      const routes = [
        {
          path: '',
          component: HomeComponent
        }
      ];

      @NgModule({
        imports: [RouterModule.forRoot(routes, { })],
        exports: [RouterModule]
      })
      export class AppRoutingModule { }`;

    const sources = {
      'app.component.ts': appComponentCode,
      'home.component.ts': homeComponentCode,
      'app-routing.module.ts': appRoutingModuleCode
    };

    expectRuleSuccess('no-unused-component', sources);
  });

  it('should report unused component', () => {
    const appComponentCode = `
      @Component({
        selector: 'app-root',
        template: '<div>app-component</div>'
      })
      export class AppComponent { }`;

    const homeComponentCode = `
      @Component({
        selector: 'app-home',
        template: '<div>app-home</div>'
      })
      export class HomeComponent { }`;

    const aboutComponentCode = `
      @Component({
        selector: 'app-about',
        template: '<div>app-about</div>'
      })
      export class AboutComponent { }`;

    const appRoutingModuleCode = `
      import { AboutComponent } from './about.component';
      import { HomeComponent } from './home.component';

      const routes = [
        {
          path: '',
          component: HomeComponent
        }
      ];

      @NgModule({
        imports: [RouterModule.forRoot(routes, { })],
        exports: [RouterModule]
      })
      export class AppRoutingModule { }`;

    const sources = {
      'app.component.ts': appComponentCode,
      'home.component.ts': homeComponentCode,
      'about.component.ts': aboutComponentCode,
      'app-routing.module.ts': appRoutingModuleCode
    };

    const failures = [
      'ERROR: about.component.ts[6,20]: The \'app-about\' component is not used. Remove it.'
    ];

    expectRuleFailures('no-unused-component', sources).toEqual(failures);
  });
});
