import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentComponent } from './student.component';
import { StudentHomeComponent } from './student-home/student-home.component';
import { StudentEditProfileComponent } from './student-edit-profile/student-edit-profile.component';
import { StudentRoutingModule } from './student-routing.module';

@NgModule({
  imports: [
    CommonModule,
    StudentRoutingModule
  ],
  declarations: [StudentComponent, StudentHomeComponent, StudentEditProfileComponent]
})
export class StudentModule { }
