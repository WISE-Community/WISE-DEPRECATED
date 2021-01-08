import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login.component';
import { LoginGoogleUserNotFoundComponent } from './login-google-user-not-found/login-google-user-not-found.component';
import { LoginHomeComponent } from './login-home/login-home.component';
import { LoginRoutingModule } from './login-routing.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RecaptchaModule, RecaptchaFormsModule } from 'ng-recaptcha';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';

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
    RecaptchaModule,
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
