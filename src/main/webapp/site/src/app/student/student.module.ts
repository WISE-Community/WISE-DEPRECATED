import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MomentModule } from 'angular2-moment';
import {
  MatButtonModule,
  MatCardModule,
  MatIconModule } from '@angular/material';

const materialModules = [
  MatButtonModule,
  MatCardModule,
  MatIconModule
];

import { SharedModule } from "../modules/shared/shared.module";
import { StudentRoutingModule } from './student-routing.module';

import { StudentComponent } from './student.component';
import { StudentHomeComponent } from './student-home/student-home.component';
import { StudentEditProfileComponent } from './student-edit-profile/student-edit-profile.component';
import { StudentRunListComponent } from './student-run-list/student-run-list.component';
import { StudentRunListItemComponent } from './student-run-list-item/student-run-list-item.component';
import { AuthGuard } from "./auth.guard";

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    MomentModule,
    materialModules,
    SharedModule,
    StudentRoutingModule
  ],
  declarations: [
    StudentComponent,
    StudentHomeComponent,
    StudentEditProfileComponent,
    StudentRunListComponent,
    StudentRunListItemComponent
  ],
  providers: [
    AuthGuard
  ],
  exports: [
    StudentComponent,
    materialModules
  ]
})
export class StudentModule { }
