import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: 'preview',
        children: [
          {path: '', loadChildren: () => import('../hybrid-module').then(m => m.PreviewAngularJSModule)}
        ]
      }
    ])
  ],
  declarations: [
  ],
  providers: [
  ],
  exports: [
  ]
})
export class PreviewModule { }
