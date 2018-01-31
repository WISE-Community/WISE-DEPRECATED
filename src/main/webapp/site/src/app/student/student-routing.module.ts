import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { StudentComponent } from './student.component';
import { StudentHomeComponent } from './student-home/student-home.component';
import { StudentEditProfileComponent } from './student-edit-profile/student-edit-profile.component';

const studentRoutes: Routes = [
  {
    path: 'student',
    component: StudentComponent,
    children: [
      { path: '', component: StudentHomeComponent },
      { path: 'profile', redirectTo: '', pathMatch: 'full' },
      { path: 'profile/edit', component: StudentEditProfileComponent }
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(studentRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class StudentRoutingModule {}
