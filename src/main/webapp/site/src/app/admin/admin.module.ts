import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../modules/shared/shared.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatButtonModule, MatCheckboxModule, MatDialogModule, MatFormFieldModule, MatIconModule,
  MatRadioModule, MatSnackBarModule, MatTableModule, MatTabsModule, MatProgressBarModule
} from '@angular/material';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { AuthGuard } from './auth.guard';
import { AdminHomeComponent } from './admin-home/admin-home.component';
import { FindUserComponent } from './find-user/find-user.component';
import { FindStudentComponent } from './find-student/find-student.component';
import { FindTeacherComponent } from './find-teacher/find-teacher.component';
import { AdminActionsComponent } from './admin-actions/admin-actions.component';

const materialModules = [
  MatButtonModule, MatCheckboxModule, MatDialogModule, MatFormFieldModule, MatIconModule,
  MatRadioModule, MatSnackBarModule, MatTableModule, MatTabsModule, ReactiveFormsModule,
  MatProgressBarModule
];

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FlexLayoutModule,
    FormsModule,
    AdminRoutingModule,
    materialModules
  ],
  declarations: [
    AdminComponent,
    AdminHomeComponent,
    FindUserComponent,
    FindStudentComponent,
    FindTeacherComponent,
    AdminActionsComponent
  ],
  entryComponents: [
    AdminActionsComponent
  ],
  providers: [
    AuthGuard
  ],
  exports: [
    AdminComponent,
    materialModules
  ]
})
export class AdminModule { }
