import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ForgotComponent } from './forgot.component';
import { ForgotHomeComponent } from './forgot-home/forgot-home.component';
import { ForgotStudentComponent } from './student/forgot-student/forgot-student.component';
import { ForgotStudentUsernameComponent } from './student/forgot-student-username/forgot-student-username.component';
import { ForgotStudentPasswordComponent } from './student/forgot-student-password/forgot-student-password.component';
import { ForgotStudentPasswordSecurityComponent } from './student/forgot-student-password-security/forgot-student-password-security.component';
import { ForgotStudentPasswordChangeComponent } from './student/forgot-student-password-change/forgot-student-password-change.component';
import { ForgotStudentPasswordCompleteComponent } from './student/forgot-student-password-complete/forgot-student-password-complete.component';
import { ForgotTeacherComponent } from './teacher/forgot-teacher/forgot-teacher.component';
import { ForgotTeacherUsernameComponent } from './teacher/forgot-teacher-username/forgot-teacher-username.component';
import { ForgotTeacherUsernameCompleteComponent } from './teacher/forgot-teacher-username-complete/forgot-teacher-username-complete.component';
import { ForgotTeacherPasswordComponent } from './teacher/forgot-teacher-password/forgot-teacher-password.component';
import { ForgotTeacherPasswordVerifyComponent } from './teacher/forgot-teacher-password-verify/forgot-teacher-password-verify.component';
import { ForgotTeacherPasswordChangeComponent } from './teacher/forgot-teacher-password-change/forgot-teacher-password-change.component';
import { ForgotTeacherPasswordCompleteComponent } from './teacher/forgot-teacher-password-complete/forgot-teacher-password-complete.component';

const routes: Routes = [
  {
    path: '',
    component: ForgotComponent,
    children: [
      { path: '', component: ForgotHomeComponent },
      { path: 'student', component: ForgotStudentComponent },
      { path: 'student/username', component: ForgotStudentUsernameComponent },
      { path: 'student/password', component: ForgotStudentPasswordComponent },
      { path: 'student/password/security', component: ForgotStudentPasswordSecurityComponent },
      { path: 'student/password/change', component: ForgotStudentPasswordChangeComponent },
      { path: 'student/password/complete', component: ForgotStudentPasswordCompleteComponent },
      { path: 'teacher', component: ForgotTeacherComponent },
      { path: 'teacher/username', component: ForgotTeacherUsernameComponent },
      { path: 'teacher/username/complete', component: ForgotTeacherUsernameCompleteComponent },
      { path: 'teacher/password', component: ForgotTeacherPasswordComponent },
      { path: 'teacher/password/verify', component: ForgotTeacherPasswordVerifyComponent },
      { path: 'teacher/password/change', component: ForgotTeacherPasswordChangeComponent },
      { path: 'teacher/password/complete', component: ForgotTeacherPasswordCompleteComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ForgotRoutingModule {}
