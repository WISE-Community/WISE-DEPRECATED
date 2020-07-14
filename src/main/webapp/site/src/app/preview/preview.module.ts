import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: 'preview',
        children: [
          {path: '', loadChildren: () => import('../student/student-angular-js-module').then(m => m.PreviewAngularJSModule)}
        ]
      }
    ])
  ],
  declarations: [
  ],
  entryComponents: [
  ],
  providers: [
  ],
  exports: [
  ]
})
export class PreviewModule { }
