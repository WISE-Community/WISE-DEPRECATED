import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from "../modules/shared/shared.module";
import { TeacherRoutingModule } from './teacher-routing.module';
import { TeacherComponent } from './teacher.component';
import { TeacherHomeComponent } from "./teacher-home/teacher-home.component";
import { AuthGuard } from "./auth.guard";
import { TeacherProjectListComponent } from './teacher-project-list/teacher-project-list.component';
import { TeacherProjectListItemComponent } from './teacher-project-list-item/teacher-project-list-item.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MomentModule } from 'ngx-moment';
import {
  MatButtonModule,
  MatCardModule, MatDividerModule,
  MatIconModule, MatMenuModule, MatTabsModule
} from '@angular/material';
import { ProjectRunMenuComponent } from './project-run-menu/project-run-menu.component';
import { LibraryModule } from "../modules/library/library.module";

const materialModules = [
  MatButtonModule,
  MatDividerModule,
  MatCardModule,
  MatIconModule,
  MatMenuModule,
  MatTabsModule
];
@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    LibraryModule,
    materialModules,
    MomentModule,
    SharedModule,
    TeacherRoutingModule
  ],
  declarations: [
    TeacherComponent,
    TeacherHomeComponent,
    TeacherProjectListComponent,
    TeacherProjectListItemComponent,
    ProjectRunMenuComponent
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
