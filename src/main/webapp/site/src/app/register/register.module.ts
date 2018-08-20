import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegisterComponent } from './register.component';
import { RegisterRoutingModule } from "./register-routing.module";
import { RegisterTeacherComponent } from './register-teacher/register-teacher.component';
import { RegisterHomeComponent } from './register-home/register-home.component';
import {
  MatButtonModule,
  MatCardModule,
  MatCheckboxModule,
  MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule
} from "@angular/material";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RegisterTeacherFormComponent } from './register-teacher-form/register-teacher-form.component';
import { RegisterTeacherCompleteComponent } from './register-teacher-complete/register-teacher-complete.component';
import { RegisterTeacherGoogleUserAlreadyExistsComponent } from './register-teacher-google-user-already-exists/register-teacher-google-user-already-exists.component';
import { RegisterStudentFormComponent } from './register-student-form/register-student-form.component';
import { RegisterStudentCompleteComponent } from './register-student-complete/register-student-complete.component';

const materialModules = [
  MatButtonModule,
  MatCardModule,
  MatCheckboxModule,
  MatDialogModule,
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
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
    RegisterTeacherGoogleUserAlreadyExistsComponent,
    RegisterStudentFormComponent,
    RegisterStudentCompleteComponent
  ],
  exports: [ RegisterComponent ]
})
export class RegisterModule { }
