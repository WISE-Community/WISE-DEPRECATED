import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { StudentComponent } from './student.component';
import { StudentHomeComponent } from './student-home/student-home.component';
import { AuthGuard } from './auth.guard';
import { EditComponent } from './account/edit/edit.component';

const studentRoutes: Routes = [
  {
    path: '',
    component: StudentComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: StudentHomeComponent, pathMatch: 'full' },
      { path: 'profile', redirectTo: '', pathMatch: 'full' },
      { path: 'profile/edit', component: EditComponent },
      {
        path: '',
        loadChildren: () =>
          import('../student-hybrid-angular.module').then((m) => m.StudentVLEAngularJSModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(studentRoutes)],
  exports: [RouterModule]
})
export class StudentRoutingModule {}
