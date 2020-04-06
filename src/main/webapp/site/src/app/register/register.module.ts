import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegisterComponent } from './register.component';
import { RegisterRoutingModule } from './register-routing.module';
import { RegisterTeacherComponent } from './register-teacher/register-teacher.component';
import { RegisterHomeComponent } from './register-home/register-home.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RegisterTeacherFormComponent } from './register-teacher-form/register-teacher-form.component';
import { RegisterTeacherCompleteComponent } from './register-teacher-complete/register-teacher-complete.component';
import { RegisterStudentFormComponent } from './register-student-form/register-student-form.component';
import { RegisterStudentCompleteComponent } from './register-student-complete/register-student-complete.component';
import { RegisterStudentComponent } from './register-student/register-student.component';
import { RegisterGoogleUserAlreadyExistsComponent } from './register-google-user-already-exists/register-google-user-already-exists.component';
import { SharedModule } from '../modules/shared/shared.module';
import {
  MatButtonModule,
  MatCardModule,
  MatCheckboxModule,
  MatDialogModule,
  MatFormFieldModule,
  MatInputModule,
  MatProgressBarModule,
  MatSelectModule
} from '@angular/material';

const materialModules = [
  MatButtonModule,
  MatCardModule,
  MatCheckboxModule,
  MatDialogModule,
  MatFormFieldModule,
  MatInputModule,
  MatProgressBarModule,
  MatSelectModule
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    RegisterRoutingModule,
    ReactiveFormsModule,
    materialModules
  ],
  declarations: [
    RegisterComponent,
    RegisterHomeComponent,
    RegisterTeacherComponent,
    RegisterTeacherFormComponent,
    RegisterTeacherCompleteComponent,
    RegisterStudentFormComponent,
    RegisterStudentCompleteComponent,
    RegisterStudentComponent,
    RegisterGoogleUserAlreadyExistsComponent
  ],
  exports: [RegisterComponent]
})
export class RegisterModule {}
