import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../modules/shared/shared.module';
import { TeacherRoutingModule } from './teacher-routing.module';
import { TeacherComponent } from './teacher.component';
import { TeacherHomeComponent } from './teacher-home/teacher-home.component';
import { AuthGuard } from './auth.guard';
import { TeacherRunListComponent } from './teacher-run-list/teacher-run-list.component';
import { TeacherRunListItemComponent } from './teacher-run-list-item/teacher-run-list-item.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MomentModule } from 'ngx-moment';
import { FormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRadioModule } from '@angular/material/radio';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { RunMenuComponent } from './run-menu/run-menu.component';
import { CreateRunDialogComponent } from './create-run-dialog/create-run-dialog.component';
import { LibraryModule } from '../modules/library/library.module';
import { ShareRunDialogComponent } from './share-run-dialog/share-run-dialog.component';
import { TimelineModule } from '../modules/timeline/timeline.module';
import { EditComponent } from './account/edit/edit.component';
import { EditProfileComponent } from './account/edit-profile/edit-profile.component';
import { RunSettingsDialogComponent } from './run-settings-dialog/run-settings-dialog.component';
import { UseWithClassWarningDialogComponent } from './use-with-class-warning-dialog/use-with-class-warning-dialog.component';
import { EditRunWarningDialogComponent } from './edit-run-warning-dialog/edit-run-warning-dialog.component';
import { ListClassroomCoursesDialogComponent } from './list-classroom-courses-dialog/list-classroom-courses-dialog.component';
import { DiscourseRecentActivityComponent } from './discourse-recent-activity/discourse-recent-activity.component';
import { ShareRunCodeDialogComponent } from './share-run-code-dialog/share-run-code-dialog.component';

const materialModules = [
  MatAutocompleteModule,
  MatButtonModule,
  MatCardModule,
  MatCheckboxModule,
  MatDatepickerModule,
  MatDialogModule,
  MatDividerModule,
  MatIconModule,
  MatMenuModule,
  MatNativeDateModule,
  MatProgressBarModule,
  MatRadioModule,
  MatSnackBarModule,
  MatTabsModule,
  MatTableModule,
  MatTooltipModule
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
    TimelineModule,
    ClipboardModule
  ],
  declarations: [
    CreateRunDialogComponent,
    DiscourseRecentActivityComponent,
    TeacherComponent,
    TeacherHomeComponent,
    TeacherRunListComponent,
    TeacherRunListItemComponent,
    RunMenuComponent,
    RunSettingsDialogComponent,
    ShareRunDialogComponent,
    EditComponent,
    EditProfileComponent,
    UseWithClassWarningDialogComponent,
    EditRunWarningDialogComponent,
    ListClassroomCoursesDialogComponent,
    ShareRunCodeDialogComponent
  ],
  providers: [AuthGuard],
  exports: [TeacherComponent, materialModules]
})
export class TeacherModule {}
