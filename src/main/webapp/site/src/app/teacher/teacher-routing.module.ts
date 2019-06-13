import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from "./auth.guard";
import { TeacherComponent } from "./teacher.component";
import { TeacherHomeComponent } from "./teacher-home/teacher-home.component";
import { EditComponent } from "./account/edit/edit.component";
import { TeacherProjectLibraryComponent } from "../modules/library/teacher-project-library/teacher-project-library.component";

const teacherRoutes: Routes = [
  {
    path: 'teacher',
    component: TeacherComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'profile', redirectTo: '', pathMatch: 'full' },
      { path: 'profile/edit', component: EditComponent },
      {
        path: 'home',
        children: [
          { path: '', redirectTo: 'schedule', pathMatch: 'full' },
          { path: 'schedule', component: TeacherHomeComponent, data: { selectedTabIndex: 0 } },
          {
            path: 'library',
            component: TeacherHomeComponent,
            data: { selectedTabIndex: 1 },
            children: [
              { path: '', redirectTo: 'tested', pathMatch: 'full' },
              { path: 'tested', component: TeacherProjectLibraryComponent, data: { selectedTabIndex: 0 } },
              { path: 'community', component: TeacherProjectLibraryComponent, data: { selectedTabIndex: 1 } },
              { path: 'personal', component: TeacherProjectLibraryComponent, data: { selectedTabIndex: 2 } },
              { path: '**', component: TeacherHomeComponent }
            ]
          },
        ] },
    ],
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
