import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentComponent } from './student.component';
import { StudentHomeComponent } from './student-home/student-home.component';
import { StudentEditProfileComponent } from './student-edit-profile/student-edit-profile.component';
import { StudentRoutingModule } from './student-routing.module';
import { StudentRunListComponent } from './student-run-list/student-run-list.component';
import { StudentRunListItemComponent } from './student-run-list-item/student-run-list-item.component';

@NgModule({
  imports: [
    CommonModule,
    StudentRoutingModule
  ],
  declarations: [
    StudentComponent,
    StudentHomeComponent,
    StudentEditProfileComponent,
    StudentRunListComponent,
    StudentRunListItemComponent
  ]
})
export class StudentModule { }
