import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { AdminComponent } from './admin.component';
import { AdminHomeComponent } from './admin-home/admin-home.component';
import { FindUserComponent } from './find-user/find-user.component';
import { ManageNewsComponent } from './manage-news/manage-news.component';

const adminRoutes: Routes = [
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', pathMatch: 'full', component: AdminHomeComponent },
      { path: 'search', pathMatch: 'full', component: FindUserComponent },
      { path: 'news', pathMatch: 'full', component: ManageNewsComponent }
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(adminRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class AdminRoutingModule { }
