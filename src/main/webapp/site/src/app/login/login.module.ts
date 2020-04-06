import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login.component';
import { LoginGoogleUserNotFoundComponent } from './login-google-user-not-found/login-google-user-not-found.component';
import { LoginHomeComponent } from './login-home/login-home.component';
import { LoginRoutingModule } from './login-routing.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RecaptchaModule } from 'ng-recaptcha';
import { RecaptchaFormsModule } from 'ng-recaptcha/forms';

import {
  MatButtonModule,
  MatCardModule,
  MatDividerModule,
  MatFormFieldModule,
  MatInputModule,
  MatProgressBarModule
} from '@angular/material';

const materialModules = [
  MatButtonModule,
  MatCardModule,
  MatDividerModule,
  MatFormFieldModule,
  MatInputModule,
  MatProgressBarModule
];

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    FormsModule,
    LoginRoutingModule,
    ReactiveFormsModule,
    materialModules,
    RecaptchaModule.forRoot(),
    RecaptchaFormsModule
  ],
  declarations: [
    LoginComponent,
    LoginHomeComponent,
    LoginGoogleUserNotFoundComponent,
    LoginComponent
  ],
  exports: [LoginComponent]
})
export class LoginModule {}
