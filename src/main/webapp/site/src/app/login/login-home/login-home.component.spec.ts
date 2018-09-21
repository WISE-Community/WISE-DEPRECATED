import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginHomeComponent } from './login-home.component';
import { UserService } from "../../services/user.service";
import { Observable } from "rxjs";
import { User } from "../../domain/user";
import { Router } from '@angular/router';
import { HttpClient, HttpHandler } from "@angular/common/http";
import { LoginModule } from "../login.module";
import { RouterTestingModule } from "@angular/router/testing";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import {
  MatCardModule,
  MatDividerModule,
  MatFormFieldModule, MatInputModule
} from "@angular/material";
import { ConfigService } from '../../services/config.service';
import { Config } from "../../domain/config";

describe('LoginComponent', () => {
  let component: LoginHomeComponent;
  let fixture: ComponentFixture<LoginHomeComponent>;
  const userServiceStub = {
    userUrl: 'api/user/user',
    user: { name: 'Test User1' },
    isAuthenticated: false,
    getUser(): Observable<User> {
      let user : any[] = [{id:1,name:"Test User1"},{id:2,name:"Test User 2"}];
      return Observable.create( observer => {
        observer.next(user);
        observer.complete();
      });}
  };
  const configServiceStub = {
    getConfig(): Observable<Config> {
      const config : Config = {"contextPath":"vle","logOutURL":"/logout","currentTime":20180730};
      return Observable.create( observer => {
        observer.next(config);
        observer.complete();
      });
    },
  getContextPath(): string {
    return '/wise';
  }
  };
  class RouterStub {
    navigateByUrl(url: string) {
      return url;
    }
  };
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoginHomeComponent ],
      imports: [
        BrowserAnimationsModule,
        RouterTestingModule.withRoutes([]),
        FormsModule,
        MatFormFieldModule,
        MatCardModule,
        MatDividerModule,
        MatInputModule
      ],
      providers: [
        HttpClient,
        HttpHandler,
        { provide: UserService, useValue: userServiceStub },
        { provide: ConfigService, useValue: configServiceStub }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
