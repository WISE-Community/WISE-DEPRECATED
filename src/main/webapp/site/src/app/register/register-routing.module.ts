import { NgModule } from '@angular/core';
import { RouterModule, Routes } from "@angular/router";

import { RegisterComponent } from "./register.component";
import { RegisterTeacherComponent } from "./register-teacher/register-teacher.component";
import { RegisterHomeComponent } from "./register-home/register-home.component";
import { RegisterTeacherFormComponent } from "./register-teacher-form/register-teacher-form.component";
import { RegisterTeacherCompleteComponent } from "./register-teacher-complete/register-teacher-complete.component";
import { RegisterTeacherGoogleUserAlreadyExistsComponent } from "./register-teacher-google-user-already-exists/register-teacher-google-user-already-exists.component";

const registerRoutes: Routes = [
  {
    path: '',
    component: RegisterComponent,
    children: [
      { path: '', component: RegisterHomeComponent },
      { path: 'join/teacher', component: RegisterTeacherComponent },
      { path: 'join/teacher/complete', component: RegisterTeacherCompleteComponent },
      { path: 'join/teacher/form', component: RegisterTeacherFormComponent },
      { path: 'join/teacher/googleUserAlreadyExists', component: RegisterTeacherGoogleUserAlreadyExistsComponent }
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(registerRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class RegisterRoutingModule {}
