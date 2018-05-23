import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';

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
