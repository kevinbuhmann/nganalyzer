import { getNgProgram } from './ng-program';
import { getTypescriptProgram } from './spec/spec.helpers';

describe('getNgProgram', () => {
  it('should work', () => {
    const appComponentCode = `
      @Component({
        selector: 'app-root',
        template: '<div>app-root</div>'
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
          component: HomeComponent,
          children: [
            {
              path: 'about',
              component: AboutComponent
            }
          ]
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

    const program = getTypescriptProgram(sources);
    const ngProgram = getNgProgram(program);

    expect(ngProgram.components.length).toBe(3);

    expect(ngProgram.components[0].path).toBe('app.component.ts');
    expect(ngProgram.components[0].name).toBe('AppComponent');
    expect(ngProgram.components[0].selector).toBe('app-root');
    expect(ngProgram.components[0].template).toBe('<div>app-root</div>');

    expect(ngProgram.components[1].path).toBe('home.component.ts');
    expect(ngProgram.components[1].name).toBe('HomeComponent');
    expect(ngProgram.components[1].selector).toBe('app-home');
    expect(ngProgram.components[1].template).toBe('<div>app-home</div>');

    expect(ngProgram.components[2].path).toBe('about.component.ts');
    expect(ngProgram.components[2].name).toBe('AboutComponent');
    expect(ngProgram.components[2].selector).toBe('app-about');
    expect(ngProgram.components[2].template).toBe('<div>app-about</div>');

    expect(ngProgram.routedComponents.length).toBe(2);
    expect(ngProgram.routedComponents[0]).toBe(ngProgram.components[1]);
    expect(ngProgram.routedComponents[1]).toBe(ngProgram.components[2]);
  });
});
