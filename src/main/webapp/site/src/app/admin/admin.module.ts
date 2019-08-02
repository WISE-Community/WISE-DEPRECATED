import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../modules/shared/shared.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import {
  MatButtonModule, MatCheckboxModule, MatDialogModule, MatIconModule,
  MatRadioModule, MatSnackBarModule, MatTableModule, MatTabsModule
} from '@angular/material';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { AuthGuard } from './auth.guard';
import { AdminHomeComponent } from './admin-home/admin-home.component';
import { FindUserComponent } from './find-user/find-user.component';
import { FindStudentComponent } from './find-student/find-student.component';
import { FindTeacherComponent } from './find-teacher/find-teacher.component';
import {OverlayModule} from '@angular/cdk/overlay';

const materialModules = [
  MatButtonModule, MatCheckboxModule, MatDialogModule, MatIconModule,
  MatRadioModule, MatSnackBarModule, MatTableModule, MatTabsModule
];

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FlexLayoutModule,
    FormsModule,
    AdminRoutingModule,
    materialModules,
    OverlayModule
  ],
  declarations: [
    AdminComponent,
    AdminHomeComponent,
    FindUserComponent,
    FindStudentComponent,
    FindTeacherComponent
  ],
  entryComponents: [
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
