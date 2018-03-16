import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';

import { HeaderModule } from './modules/header/header.module';
import { HomeModule } from "./home/home.module";
import { FooterModule } from './modules/footer/footer.module';
import { StudentModule } from './student/student.module';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { StudentService } from './student/student.service';
import { UserService } from "./services/user.service";


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
