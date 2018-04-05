import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';

import { HeaderModule } from './modules/header/header.module';
import { HomeModule } from "./home/home.module";
import { FooterModule } from './modules/footer/footer.module';
import { StudentModule } from './student/student.module';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { StudentService } from './student/student.service';
import { UserService } from './services/user.service';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FooterModule,
    HeaderModule,
    HomeModule,
    FormsModule,
    StudentModule,
    HttpClientModule
  ],
  providers: [
    StudentService,
    UserService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
