import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RegisterComponent } from './register.component';
import { RegisterHomeComponent } from './register-home/register-home.component';
import { RegisterStudentFormComponent } from './register-student-form/register-student-form.component';
import { RegisterStudentCompleteComponent } from './register-student-complete/register-student-complete.component';
import { RegisterTeacherComponent } from './register-teacher/register-teacher.component';
import { RegisterTeacherFormComponent } from './register-teacher-form/register-teacher-form.component';
import { RegisterTeacherCompleteComponent } from './register-teacher-complete/register-teacher-complete.component';
import { RegisterStudentComponent } from './register-student/register-student.component';
import { RegisterGoogleUserAlreadyExistsComponent } from './register-google-user-already-exists/register-google-user-already-exists.component';

const registerRoutes: Routes = [
  {
    path: '',
    component: RegisterComponent,
    children: [
      { path: '', component: RegisterHomeComponent },
      { path: 'student', component: RegisterStudentComponent },
      { path: 'student/form', component: RegisterStudentFormComponent },
      { path: 'student/complete', component: RegisterStudentCompleteComponent },
      { path: 'teacher', component: RegisterTeacherComponent },
      { path: 'teacher/complete', component: RegisterTeacherCompleteComponent },
      { path: 'teacher/form', component: RegisterTeacherFormComponent },
      { path: 'googleUserAlreadyExists', component: RegisterGoogleUserAlreadyExistsComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(registerRoutes)],
  exports: [RouterModule]
})
export class RegisterRoutingModule {}
