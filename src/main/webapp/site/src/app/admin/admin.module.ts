import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../modules/shared/shared.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatButtonModule, MatCheckboxModule, MatDialogModule, MatFormFieldModule, MatIconModule,
  MatRadioModule, MatSnackBarModule, MatTableModule, MatTabsModule, MatProgressBarModule, MatDividerModule
} from '@angular/material';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { AuthGuard } from './auth.guard';
import { AdminHomeComponent } from './admin-home/admin-home.component';
import { FindUserComponent } from './find-user/find-user.component';
import { FindStudentComponent } from './find-student/find-student.component';
import { FindTeacherComponent } from './find-teacher/find-teacher.component';
import { AdminActionsComponent } from './admin-actions/admin-actions.component';
import { ManageNewsComponent } from './manage-news/manage-news.component';
import { NewsModule } from '../news/news.module';

const materialModules = [
  MatButtonModule, MatCheckboxModule, MatDialogModule, MatFormFieldModule, MatIconModule,
  MatRadioModule, MatSnackBarModule, MatTableModule, MatTabsModule, ReactiveFormsModule,
  MatProgressBarModule, MatDividerModule
];

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FlexLayoutModule,
    FormsModule,
    AdminRoutingModule,
    NewsModule,
    materialModules
  ],
  declarations: [
    AdminComponent,
    AdminHomeComponent,
    FindUserComponent,
    FindStudentComponent,
    FindTeacherComponent,
    AdminActionsComponent,
    ManageNewsComponent
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
