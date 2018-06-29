import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from "../modules/shared/shared.module";
import { TeacherRoutingModule } from './teacher-routing.module';
import { TeacherComponent } from './teacher.component';
import { TeacherHomeComponent } from "./teacher-home/teacher-home.component";
import { AuthGuard } from "./auth.guard";
import { StudentComponent } from "../student/student.component";

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    TeacherRoutingModule
  ],
  declarations: [
    TeacherComponent,
    TeacherHomeComponent
  ],
  providers: [
    AuthGuard
  ],
  exports: [
    TeacherComponent
  ]
})
export class TeacherModule { }
