import { BrowserModule } from '@angular/platform-browser';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { ConfigService } from "./services/config.service";
import { HeaderModule } from './modules/header/header.module';
import { FooterModule } from './modules/footer/footer.module';
import { StudentModule } from './student/student.module';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { StudentService } from './student/student.service';
import { UserService } from './services/user.service';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Config } from "./domain/config";

export function initialize(configService: ConfigService, userService: UserService) {
  return () => {
    return userService.retrieveUserPromise().then((user) => {
      configService.subscribeToGetUser();
    });
  }
}

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
    FormsModule,
    StudentModule,
    HttpClientModule
  ],
  providers: [
    ConfigService,
    StudentService,
    UserService,
    {
      provide: APP_INITIALIZER,
      useFactory: initialize,
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
