import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { ConfigService } from "./services/config.service";
import { HeaderModule } from './modules/header/header.module';
import { HomeModule } from "./home/home.module";
import { FooterModule } from './modules/footer/footer.module';
import { StudentModule } from './student/student.module';
import { StudentService } from './student/student.service';
import { UserService } from './services/user.service';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    FooterModule,
    HeaderModule,
    HomeModule,
    StudentModule
  ],
  providers: [
    ConfigService,
    StudentService,
    UserService,
    {
      provide: APP_INITIALIZER,
      useFactory: (configService: ConfigService, userService: UserService) =>
        function() {
          return userService.retrieveUser().subscribe((user) => {
            configService.subscribeToGetUser();
          });
        },
      deps: [
        ConfigService,
        UserService
      ],
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
