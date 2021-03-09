import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './login.component';
import { LoginHomeComponent } from './login-home/login-home.component';
import { LoginGoogleUserNotFoundComponent } from './login-google-user-not-found/login-google-user-not-found.component';

const loginRoutes: Routes = [
  {
    path: '',
    component: LoginComponent,
    children: [
      { path: '', component: LoginHomeComponent },
      { path: 'googleUserNotFound', component: LoginGoogleUserNotFoundComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(loginRoutes)],
  exports: [RouterModule]
})
export class LoginRoutingModule {}
