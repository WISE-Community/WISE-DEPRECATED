import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterStudentFormComponent } from './register-student-form.component';
import { RegisterModule } from "../register.module";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterTestingModule } from "@angular/router/testing";
import { StudentRun } from "../../student/student-run";
import { Observable } from "rxjs/Observable";
import { StudentService } from "../../student/student.service";

describe('RegisterStudentFormComponent', () => {
  let component: RegisterStudentFormComponent;
  let fixture: ComponentFixture<RegisterStudentFormComponent>;

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
    TestBed.configureTestingModule({
      declarations: [ ],
      imports: [ BrowserAnimationsModule, RegisterModule, RouterTestingModule ],
      providers: [
        { provide: StudentService, useValue: studentServiceStub }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterStudentFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
