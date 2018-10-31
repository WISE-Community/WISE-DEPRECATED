import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ForgotRoutingModule } from './forgot-routing.module';
import { ForgotHomeComponent } from './forgot-home/forgot-home.component';
import { ForgotComponent } from './forgot.component';
import { SharedModule } from '../modules/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ForgotStudentComponent } from './student/forgot-student/forgot-student.component';
import { ForgotTeacherComponent } from './teacher/forgot-teacher/forgot-teacher.component';
import { ForgotStudentPasswordComponent } from './student/forgot-student-password/forgot-student-password.component';
import { ForgotStudentUsernameComponent } from './student/forgot-student-username/forgot-student-username.component';
import { ForgotTeacherUsernameComponent } from './teacher/forgot-teacher-username/forgot-teacher-username.component';
import { ForgotTeacherPasswordComponent } from './teacher/forgot-teacher-password/forgot-teacher-password.component';
import { ForgotStudentPasswordSecurityComponent } from './student/forgot-student-password-security/forgot-student-password-security.component';
import { ForgotStudentPasswordChangeComponent } from './student/forgot-student-password-change/forgot-student-password-change.component';
import { ForgotStudentPasswordCompleteComponent } from './student/forgot-student-password-complete/forgot-student-password-complete.component';

@NgModule({
  imports: [
    CommonModule,
    ForgotRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ],
  declarations: [
    ForgotComponent,
    ForgotHomeComponent,
    ForgotStudentComponent,
    ForgotTeacherComponent,
    ForgotStudentPasswordComponent,
    ForgotStudentUsernameComponent,
    ForgotTeacherUsernameComponent,
    ForgotTeacherPasswordComponent,
    ForgotStudentPasswordSecurityComponent,
    ForgotStudentPasswordChangeComponent,
    ForgotStudentPasswordCompleteComponent
  ],
  exports: [
    ForgotComponent
  ]
})
export class ForgotModule { }
