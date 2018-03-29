import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from "@angular/forms";
import { LoginComponent } from './login.component';
import { UserService } from "../services/user.service";
import { Observable } from "rxjs/Observable";
import { StudentRun } from "../student/student-run";
import { User } from "../domain/user";
import { Router } from '@angular/router';
import { HttpClient, HttpHandler } from "@angular/common/http";

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async(() => {
    let userServiceStub = {
      userUrl: 'api/user/user',
      user: { name: 'Test User1' },
      authenticated: false,
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
      declarations: [ LoginComponent ],
      imports: [ FormsModule],
      providers: [
        HttpClient,
        HttpHandler,
        { provide: Router, useClass: RouterStub },
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
