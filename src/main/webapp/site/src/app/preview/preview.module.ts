import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PreviewComponent } from './preview.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: 'preview',
        component: PreviewComponent,
        children: [
          { path: '', loadChildren: () => import('./preview-angular-js-module').then(m => m.PreviewAngularJSModule)}
        ]
      }
    ])
  ],
  declarations: [
    PreviewComponent
  ],
  entryComponents: [
  ],
  providers: [
  ],
  exports: [
    PreviewComponent,
  ]
})
export class PreviewModule { }
