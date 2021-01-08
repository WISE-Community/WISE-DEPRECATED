import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ForgotStudentPasswordSecurityComponent } from './forgot-student-password-security.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/index';
import { StudentService } from '../../../student/student.service';
import { configureTestSuite } from 'ng-bullet';

export class MockStudentService {
  checkSecurityAnswer(username: string, answer: string): Observable<any> {
    return Observable.create((observer) => {
      observer.next({
        status: 'success',
        messageCode: 'correctAnswer'
      });
      observer.complete();
    });
  }
}

describe('ForgotStudentPasswordSecurityComponent', () => {
  let component: ForgotStudentPasswordSecurityComponent;
  let fixture: ComponentFixture<ForgotStudentPasswordSecurityComponent>;

  const submitAndReceiveResponse = (studentServiceFunctionName, status, messageCode) => {
    const studentService = TestBed.get(StudentService);
    const observableResponse = createObservableResponse(status, messageCode);
    spyOn(studentService, studentServiceFunctionName).and.returnValue(observableResponse);
    component.submit();
    fixture.detectChanges();
  };

  const createObservableResponse = (status, messageCode) => {
    const observableResponse = Observable.create((observer) => {
      const response = {
        status: status,
        messageCode: messageCode
      };
      observer.next(response);
      observer.complete();
    });
    return observableResponse;
  };

  const getErrorMessage = () => {
    const errorMessageDiv = fixture.debugElement.nativeElement.querySelector('.warn');
    return errorMessageDiv.textContent;
  };

  const getSubmitButton = () => {
    return fixture.debugElement.nativeElement.querySelector('button[type="submit"]');
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [ForgotStudentPasswordSecurityComponent],
      imports: [RouterTestingModule, BrowserAnimationsModule, ReactiveFormsModule],
      providers: [{ provide: StudentService, useClass: MockStudentService }],
      schemas: [NO_ERRORS_SCHEMA]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ForgotStudentPasswordSecurityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should disable the submit button if the answer field is not filled in', () => {
    fixture.detectChanges();
    const submitButton = getSubmitButton();
    expect(submitButton.disabled).toBe(true);
  });

  it('should enable the submit button when the answer field is filled in', () => {
    component.setControlFieldValue('answer', 'cookies');
    fixture.detectChanges();
    const submitButton = getSubmitButton();
    expect(submitButton.disabled).toBe(false);
  });

  it('should show the incorrect answer message', () => {
    submitAndReceiveResponse('checkSecurityAnswer', 'failure', 'incorrectAnswer');
    expect(getErrorMessage()).toContain('Incorrect answer');
  });

  it('should navigate to change password page', () => {
    const router = TestBed.get(Router);
    const navigateSpy = spyOn(router, 'navigate');
    const username = 'SpongebobS0101';
    const questionKey = 'QUESTION_ONE';
    const answer = 'cookie';
    component.username = username;
    component.questionKey = questionKey;
    component.setControlFieldValue('answer', answer);
    component.goToChangePasswordPage();
    const params = {
      username: username,
      questionKey: questionKey,
      answer: answer
    };
    expect(navigateSpy).toHaveBeenCalledWith(['/forgot/student/password/change'], {
      queryParams: params,
      skipLocationChange: true
    });
  });
});
