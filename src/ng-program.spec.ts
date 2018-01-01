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

    const [appComponent, homeComponent, aboutComponent] = ngProgram.components;

    expect(appComponent).toBeTruthy();
    expect(appComponent.path).toBe('app.component.ts');
    expect(appComponent.name).toBe('AppComponent');
    expect(appComponent.selector).toBe('app-root');
    expect(appComponent.template).toBe('<div>app-root</div>');

    expect(homeComponent).toBeTruthy();
    expect(homeComponent.path).toBe('home.component.ts');
    expect(homeComponent.name).toBe('HomeComponent');
    expect(homeComponent.selector).toBe('app-home');
    expect(homeComponent.template).toBe('<div>app-home</div>');

    expect(aboutComponent).toBeTruthy();
    expect(aboutComponent.path).toBe('about.component.ts');
    expect(aboutComponent.name).toBe('AboutComponent');
    expect(aboutComponent.selector).toBe('app-about');
    expect(aboutComponent.template).toBe('<div>app-about</div>');

    expect(ngProgram.routedComponents).toEqual([homeComponent, aboutComponent]);
  });
});
