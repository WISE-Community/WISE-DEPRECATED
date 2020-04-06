import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HelpComponent } from './help.component';
import { HelpRoutingModule } from './help-routing.module';
import { SharedModule } from '../modules/shared/shared.module';
import { GettingStartedComponent } from './getting-started/getting-started.component';
import { TeacherFaqComponent } from './teacher-faq/teacher-faq.component';
import { StudentFaqComponent } from './student-faq/student-faq.component';
import { HelpHomeComponent } from './help-home/help-home.component';

@NgModule({
  imports: [CommonModule, HelpRoutingModule, SharedModule],
  declarations: [
    HelpComponent,
    GettingStartedComponent,
    TeacherFaqComponent,
    StudentFaqComponent,
    HelpHomeComponent
  ]
})
export class HelpModule {}
