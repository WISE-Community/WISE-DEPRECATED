import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: 'preview',
        children: [
          {path: '', loadChildren: './preview-angular-js-module#PreviewAngularJSModule'}
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
