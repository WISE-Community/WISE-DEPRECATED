import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { HeaderModule } from './header/header.module';
import { FooterModule } from './footer/footer.module';
import { StudentModule } from './student/student.module';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { StudentService } from './student/student.service';
import { UserService } from './user.service';
import { HttpClientModule } from '@angular/common/http';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HeaderModule,
    FooterModule,
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
