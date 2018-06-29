import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from "./auth.guard";
import { TeacherComponent } from "../teacher/teacher.component";
import { TeacherHomeComponent } from "../teacher/teacher-home/teacher-home.component";

const teacherRoutes: Routes = [
  {
    path: 'teacher',
    component: TeacherComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: TeacherHomeComponent },
      { path: 'profile', redirectTo: '', pathMatch: 'full' },
      //{ path: 'profile/edit', component: TeacherEditProfileComponent }
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(teacherRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class TeacherRoutingModule { }
