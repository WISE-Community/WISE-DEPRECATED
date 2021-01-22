import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from './auth.guard';
import { TeacherComponent } from './teacher.component';
import { TeacherHomeComponent } from './teacher-home/teacher-home.component';
import { EditComponent } from './account/edit/edit.component';
import { TeacherProjectLibraryComponent } from '../modules/library/teacher-project-library/teacher-project-library.component';
import { TeacherRunListComponent } from './teacher-run-list/teacher-run-list.component';
import { OfficialLibraryComponent } from '../modules/library/official-library/official-library.component';
import { CommunityLibraryComponent } from '../modules/library/community-library/community-library.component';
import { PersonalLibraryComponent } from '../modules/library/personal-library/personal-library.component';

const teacherRoutes: Routes = [
  {
    path: '',
    component: TeacherComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'profile', redirectTo: 'profile/edit', pathMatch: 'full' },
      { path: 'profile/edit', component: EditComponent },
      {
        path: 'home',
        component: TeacherHomeComponent,
        children: [
          { path: '', redirectTo: 'schedule', pathMatch: 'full' },
          { path: 'schedule', component: TeacherRunListComponent },
          {
            path: 'library',
            component: TeacherProjectLibraryComponent,
            children: [
              { path: '', redirectTo: 'tested', pathMatch: 'full' },
              { path: 'tested', component: OfficialLibraryComponent },
              { path: 'community', component: CommunityLibraryComponent },
              { path: 'personal', component: PersonalLibraryComponent },
              { path: '**', redirectTo: 'tested' }
            ]
          }
        ]
      },
      {
        path: '',
        loadChildren: () =>
          import('../teacher-hybrid-angular.module').then((m) => m.TeacherAngularJSModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(teacherRoutes)],
  exports: [RouterModule]
})
export class TeacherRoutingModule {}
