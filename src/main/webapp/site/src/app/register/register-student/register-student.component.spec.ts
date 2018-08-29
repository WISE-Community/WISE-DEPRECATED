import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterStudentComponent } from './register-student.component';
import { RegisterModule } from "../register.module";
import { Observable } from "rxjs";
import { StudentRun } from "../../student/student-run";
import { User } from "../../domain/user";
import { StudentService } from "../../student/student.service";
import { UserService } from "../../services/user.service";
import { AuthService } from "angularx-social-login";
import { RouterTestingModule } from "../../../../../../../../node_modules/@angular/router/testing";
import { BrowserAnimationsModule } from "../../../../../../../../node_modules/@angular/platform-browser/animations";
import { FormsModule } from "@angular/forms";
import { MatCardModule, MatFormFieldModule, MatInputModule } from "@angular/material";

describe('RegisterStudentComponent', () => {
  let component: RegisterStudentComponent;
  let fixture: ComponentFixture<RegisterStudentComponent>;

  beforeEach(async(() => {
    const studentServiceStub = {
      isLoggedIn: true,
      getRuns(): Observable<StudentRun[]> {
        const runs : any[] = [{id:1,name:"Photosynthesis"},{id:2,name:"Plate Tectonics"}];
        return Observable.create( observer => {
          observer.next(runs);
          observer.complete();
        });
      },
      retrieveSecurityQuestions(): Observable<Object> {
        return Observable.create(observer => {
          const securityQuestions: object[] = [{"value":"What is your middle name?","key":"QUESTION_ONE"},{"value":"What is your mother's first name?","key":"QUESTION_TWO"},{"value":"What is your grandmother's first name?","key":"QUESTION_THREE"},{"value":"What is your favorite animal?","key":"QUESTION_FOUR"},{"value":"What was the last name of your first grade teacher?","key":"QUESTION_FIVE"},{"value":"What is your favorite color?","key":"QUESTION_SIX"}];
          observer.next(securityQuestions);
          observer.complete();
        });
      }
    };
    const userServiceStub = {
      getUser(): Observable<User[]> {
        const user: User = new User();
        user.firstName = 'Demo';
        user.lastName = 'Teacher';
        user.role = 'teacher';
        user.userName = 'DemoTeacher';
        user.id = 123456;
        return Observable.create( observer => {
          observer.next(user);
          observer.complete();
        });
      }
    };
    const authServiceStub = {
      signIn(): any {
      }
    };
    TestBed.configureTestingModule({
      declarations: [ RegisterStudentComponent ],
      imports: [ BrowserAnimationsModule, RouterTestingModule, FormsModule, MatCardModule, MatFormFieldModule, MatInputModule ],
      providers: [
        { provide: StudentService, useValue: studentServiceStub },
        { provide: UserService, useValue: userServiceStub },
        { provide: AuthService, useValue: authServiceStub }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterStudentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
