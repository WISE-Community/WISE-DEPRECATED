import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from "./auth.guard";
import { TeacherComponent } from "./teacher.component";
import { TeacherHomeComponent } from "./teacher-home/teacher-home.component";
import { EditComponent } from "./account/edit/edit.component";
import { TeacherProjectLibraryComponent } from "../modules/library/teacher-project-library/teacher-project-library.component";
import {Observable} from 'rxjs/internal/Observable';

const teacherRoutes: Routes = [
  {
    path: 'teacher',
    component: TeacherComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: TeacherHomeComponent },
      { path: 'profile', redirectTo: '', pathMatch: 'full' },
      { path: 'profile/edit', component: EditComponent },
      { path: 'schedule', component: TeacherHomeComponent, data: Observable.create({ selectedTabIndex: 0 }) },
      {
        path: 'library',
        component: TeacherHomeComponent,
        data: Observable.create({ selectedTabIndex: 1 }),
        children: [
          { path: 'tested', component: TeacherProjectLibraryComponent, data: Observable.create({ selectedTabIndex: 0 }) },
          { path: 'community', component: TeacherProjectLibraryComponent, data: Observable.create({ selectedTabIndex: 1 }) },
          { path: 'personal', component: TeacherProjectLibraryComponent, data: Observable.create({ selectedTabIndex: 2 }) }
        ]
      },
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
