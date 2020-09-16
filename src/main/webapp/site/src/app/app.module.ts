import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpErrorInterceptor } from "./http-error.interceptor";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterModule } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import {
  SocialLoginModule,
  AuthServiceConfig,
  GoogleLoginProvider, LoginOpt,
} from "angularx-social-login";

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { ConfigService } from "./services/config.service";
import { HeaderModule } from './modules/header/header.module';
import { HomeModule } from "./home/home.module";
import { FooterModule } from './modules/footer/footer.module';
import { LoginModule } from "./login/login.module";
import { StudentModule } from './student/student.module';
import { StudentService } from './student/student.service';
import { TeacherModule } from './teacher/teacher.module';
import { UserService } from './services/user.service';
import { TeacherService } from "./teacher/teacher.service";
import { RegisterModule } from "./register/register.module";
import { NewsModule } from "./news/news.module";
import { MobileMenuModule } from "./modules/mobile-menu/mobile-menu.module";
import { HelpModule } from "./help/help.module";
import { FeaturesModule } from "./features/features.module";
import { AnnouncementComponent } from './announcement/announcement.component';
import { AnnouncementDialogComponent } from './announcement/announcement.component';
import { AboutModule } from "./about/about.module";
import { TrackScrollDirective } from './track-scroll.directive';
import { PreviewModule } from './preview/preview.module';

export function initialize(configService: ConfigService, userService: UserService): () => Promise<any> {
  return (): Promise<any> => {
    return userService.retrieveUserPromise().then((user) => {
      userService.getUser().subscribe((user) => {
        configService.retrieveConfig();
      });
    });
  }
}

export function getAuthServiceConfigs(configService: ConfigService) {
  const autServiceConfig: AuthServiceConfig = new AuthServiceConfig([]);
  const googleLoginOptions: LoginOpt = {
    prompt: 'select_account'
  };
  configService.getConfig().subscribe((config) => {
    if (config != null) {
      if (configService.getGoogleClientId() != null) {
        autServiceConfig.providers.set(GoogleLoginProvider.PROVIDER_ID,
          new GoogleLoginProvider(configService.getGoogleClientId(), googleLoginOptions));
      }
    }
  });
  return autServiceConfig;
}

@NgModule({
  declarations: [
    AppComponent,
    AnnouncementComponent,
    AnnouncementDialogComponent,
    TrackScrollDirective
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    FooterModule,
    HeaderModule,
    HelpModule,
    HomeModule,
    LoginModule,
    MobileMenuModule,
    RegisterModule,
    PreviewModule,
    StudentModule,
    TeacherModule,
    SocialLoginModule,
    NewsModule,
    FeaturesModule,
    MatSidenavModule,
    MatDialogModule,
    AboutModule,
    RouterModule.forRoot([], {
      scrollPositionRestoration: 'enabled',
      anchorScrolling: 'enabled',
    })
  ],
  providers: [
    ConfigService,
    StudentService,
    TeacherService,
    UserService,
    {
      provide: APP_INITIALIZER,
      useFactory: initialize,
      deps: [
        ConfigService,
        UserService
      ],
      multi: true
    },
    {
      provide: AuthServiceConfig,
      useFactory: getAuthServiceConfigs,
      deps: [
        ConfigService
      ]
    },
    {
      provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
      useValue: {
        duration: 10000,
        verticalPosition: 'bottom',
        horizontalPosition: 'start'
      }
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
