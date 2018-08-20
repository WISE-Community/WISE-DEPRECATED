import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { UserService } from "../services/user.service";
import { Observable } from "rxjs";
import { User } from "../domain/user";
import { Router } from '@angular/router';
import { HttpClient, HttpHandler } from "@angular/common/http";
import { LoginModule } from "./login.module";
import { RouterTestingModule } from "@angular/router/testing";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async(() => {
    let userServiceStub = {
      userUrl: 'api/user/user',
      user: { name: 'Test User1' },
      isAuthenticated: false,
      getUser(): Observable<User> {
        let user : any[] = [{id:1,name:"Test User1"},{id:2,name:"Test User 2"}];
        return Observable.create( observer => {
          observer.next(user);
          observer.complete();
        });}
    }
    class RouterStub {
      navigateByUrl(url: string) {
        return url;
      }
    }
    TestBed.configureTestingModule({
      declarations: [],
      imports: [
        BrowserAnimationsModule,
        LoginModule,
        RouterTestingModule.withRoutes([])
      ],
      providers: [
        HttpClient,
        HttpHandler,
        { provide: UserService, useValue: userServiceStub }]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
