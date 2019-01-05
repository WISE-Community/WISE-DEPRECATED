import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from "./auth.guard";
import { TeacherComponent } from "../teacher/teacher.component";
import { TeacherHomeComponent } from "../teacher/teacher-home/teacher-home.component";
import { EditComponent } from "./account/edit/edit.component";
import { TeacherRunListComponent } from "../teacher/teacher-run-list/teacher-run-list.component";
import { TeacherProjectLibraryComponent } from "../modules/library/teacher-project-library/teacher-project-library.component";
import { OfficialLibraryComponent } from "../modules/library/official-library/official-library.component";
import { CommunityLibraryComponent } from "../modules/library/community-library/community-library.component";
import { PersonalLibraryComponent } from "../modules/library/personal-library/personal-library.component";

const teacherRoutes: Routes = [
  {
    path: 'teacher',
    component: TeacherComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: TeacherHomeComponent },
      { path: 'profile', redirectTo: '', pathMatch: 'full' },
      { path: 'profile/edit', component: EditComponent },
      { path: 'schedule', component: TeacherRunListComponent },
      { path: 'library', component: TeacherProjectLibraryComponent },
      { path: 'library/tested', component: OfficialLibraryComponent },
      { path: 'library/community', component: CommunityLibraryComponent },
      { path: 'library/personal', component: PersonalLibraryComponent }
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(teacherRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class TeacherRoutingModule { }
