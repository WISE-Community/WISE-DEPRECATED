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
  MatAutocompleteModule, MatButtonModule, MatCardModule, MatCheckboxModule,
  MatDatepickerModule, MatDialogModule, MatDividerModule, MatIconModule,
  MatMenuModule, MatNativeDateModule, MatProgressBarModule, MatRadioModule,
  MatSnackBarModule, MatTableModule, MatTabsModule, MatTooltipModule
} from '@angular/material';
import { RunMenuComponent } from './run-menu/run-menu.component';
import { CreateRunDialogComponent } from './create-run-dialog/create-run-dialog.component';
import { LibraryModule } from "../modules/library/library.module";
import { ShareRunDialogComponent } from './share-run-dialog/share-run-dialog.component';
import { TimelineModule } from "../modules/timeline/timeline.module";
import { EditComponent } from './account/edit/edit.component';
import { EditProfileComponent } from './account/edit-profile/edit-profile.component';
import { EditPasswordComponent } from './account/edit-password/edit-password.component';
import { RunSettingsDialogComponent } from './run-settings-dialog/run-settings-dialog.component';
import { EndRunDialogComponent } from './end-run-dialog/end-run-dialog.component';
import { UseWithClassWarningDialogComponent } from './use-with-class-warning-dialog/use-with-class-warning-dialog.component';

const materialModules = [
  MatAutocompleteModule, MatButtonModule, MatCardModule, MatCheckboxModule,
  MatDatepickerModule, MatDialogModule, MatDividerModule, MatIconModule,
  MatMenuModule, MatNativeDateModule, MatProgressBarModule, MatRadioModule,
  MatSnackBarModule, MatTabsModule, MatTableModule, MatTooltipModule
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
    TeacherRoutingModule,
    TimelineModule
  ],
  declarations: [
    CreateRunDialogComponent,
    TeacherComponent,
    TeacherHomeComponent,
    TeacherRunListComponent,
    TeacherRunListItemComponent,
    RunMenuComponent,
    RunSettingsDialogComponent,
    ShareRunDialogComponent,
    EditComponent,
    EditProfileComponent,
    EditPasswordComponent,
    EndRunDialogComponent,
    UseWithClassWarningDialogComponent
  ],
  entryComponents: [
    CreateRunDialogComponent,
    EndRunDialogComponent,
    RunSettingsDialogComponent,
    ShareRunDialogComponent,
    UseWithClassWarningDialogComponent
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
