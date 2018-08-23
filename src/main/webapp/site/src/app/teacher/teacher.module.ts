import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from "../modules/shared/shared.module";
import { TeacherRoutingModule } from './teacher-routing.module';
import { TeacherComponent } from './teacher.component';
import { TeacherHomeComponent } from "./teacher-home/teacher-home.component";
import { AuthGuard } from "./auth.guard";
import { TeacherRunListComponent } from './teacher-run-list/teacher-run-list.component';
import { TeacherRunListItemComponent } from './teacher-run-list-item/teacher-run-list-item.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MomentModule } from 'ngx-moment';
import { FormsModule } from '@angular/forms';
import {
  MatButtonModule, MatCardModule, MatCheckboxModule, MatDatepickerModule,
  MatDialogModule, MatDialog, MatDialogRef, MatDividerModule, MatIconModule,
  MatMenuModule, MatNativeDateModule, MatRadioModule, MatTabsModule
} from '@angular/material';
import { RunMenuComponent } from './run-menu/run-menu.component';
import { CreateRunDialogComponent } from './create-run-dialog/create-run-dialog.component';
import { LibraryModule } from "../modules/library/library.module";


const materialModules = [
  MatButtonModule,
  MatCardModule,
  MatCheckboxModule,
  MatDatepickerModule,
  MatDialogModule,
  MatDividerModule,
  MatIconModule,
  MatMenuModule,
  MatNativeDateModule,
  MatRadioModule,
  MatTabsModule
];
@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    FormsModule,
    LibraryModule,
    materialModules,
    MomentModule,
    SharedModule,
    TeacherRoutingModule
  ],
  declarations: [
    CreateRunDialogComponent,
    TeacherComponent,
    TeacherHomeComponent,
    TeacherRunListComponent,
    TeacherRunListItemComponent,
    RunMenuComponent
  ],
  entryComponents: [
    CreateRunDialogComponent
  ],
  providers: [
    AuthGuard
  ],
  exports: [
    TeacherComponent,
    materialModules
  ]
})
export class TeacherModule { }
