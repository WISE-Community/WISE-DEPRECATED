import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ForgotStudentPasswordChangeComponent } from './forgot-student-password-change.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { StudentService } from '../../../student/student.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/index';
import { configureTestSuite } from 'ng-bullet';

export class MockStudentService {
  changePassword(
    username: string,
    answer: string,
    password: string,
    confirmPassword: string
  ): Observable<any> {
    return Observable.create((observer) => {
      observer.next({
        status: 'success',
        messageCode: 'passwordChanged'
      });
      observer.complete();
    });
  }
}

describe('ForgotStudentPasswordChangeComponent', () => {
  let component: ForgotStudentPasswordChangeComponent;
  let fixture: ComponentFixture<ForgotStudentPasswordChangeComponent>;

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
      declarations: [ForgotStudentPasswordChangeComponent],
      imports: [RouterTestingModule, BrowserAnimationsModule, ReactiveFormsModule],
      providers: [{ provide: StudentService, useClass: MockStudentService }],
      schemas: [NO_ERRORS_SCHEMA]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ForgotStudentPasswordChangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should disable the submit button when the password fields are not filled in', () => {
    fixture.detectChanges();
    const submitButton = getSubmitButton();
    expect(submitButton.disabled).toBe(true);
  });

  it('should enable the submit button when the password fields are filled in', () => {
    component.setControlFieldValue('password', 'newpassword');
    component.setControlFieldValue('confirmPassword', 'newpassword');
    fixture.detectChanges();
    const submitButton = getSubmitButton();
    expect(submitButton.disabled).toBe(false);
  });

  it('should display the password cannot be blank message', () => {
    submitAndReceiveResponse('changePassword', 'failure', 'passwordIsBlank');
    expect(getErrorMessage()).toContain('Password cannot be blank');
  });

  it('should display the passwords do not match message', () => {
    component.setControlFieldValue('password', 'a');
    component.setControlFieldValue('confirmPassword', 'b');
    component.submit();
    fixture.detectChanges();
    expect(getErrorMessage()).toContain('Passwords do not match');
  });

  it('should navigate to the complete page', () => {
    const router = TestBed.get(Router);
    const navigateSpy = spyOn(router, 'navigate');
    const username = 'SpongebobS0101';
    component.username = username;
    component.goToSuccessPage();
    const params = {
      username: username
    };
    expect(navigateSpy).toHaveBeenCalledWith(['/forgot/student/password/complete'], {
      queryParams: params,
      skipLocationChange: true
    });
  });
});
