import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ForgotTeacherPasswordChangeComponent } from './forgot-teacher-password-change.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { TeacherService } from '../../../teacher/teacher.service';
import { Observable } from 'rxjs/index';
import { Router } from '@angular/router';
import { configureTestSuite } from 'ng-bullet';

export class MockTeacherService {
  changePassword(
    username: string,
    verificationCode: string,
    password: string,
    confirmPassword: string
  ): Observable<any> {
    return Observable.create((observer) => {
      observer.next({
        status: 'success',
        messageCode: 'verificationCodeCorrect'
      });
      observer.complete();
    });
  }
}

describe('ForgotTeacherPasswordChangeComponent', () => {
  let component: ForgotTeacherPasswordChangeComponent;
  let fixture: ComponentFixture<ForgotTeacherPasswordChangeComponent>;

  const submitAndReceiveResponse = (teacherServiceFunctionName, status, messageCode) => {
    const teacherService = TestBed.get(TeacherService);
    const observableResponse = createObservableResponse(status, messageCode);
    spyOn(teacherService, teacherServiceFunctionName).and.returnValue(observableResponse);
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
    const errorMessageDiv = fixture.debugElement.nativeElement.querySelector('.error-message');
    return errorMessageDiv.textContent;
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [ForgotTeacherPasswordChangeComponent],
      imports: [RouterTestingModule, ReactiveFormsModule],
      providers: [{ provide: TeacherService, useClass: MockTeacherService }],
      schemas: [NO_ERRORS_SCHEMA]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ForgotTeacherPasswordChangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the too many verification code attempts message', () => {
    submitAndReceiveResponse('changePassword', 'failure', 'tooManyVerificationCodeAttempts');
    expect(getErrorMessage()).toContain(
      'You have submitted an invalid verification code too many times'
    );
  });

  it('should show the verification code expired message', () => {
    submitAndReceiveResponse('changePassword', 'failure', 'verificationCodeExpired');
    expect(getErrorMessage()).toContain('The verification code has expired');
  });

  it('should show the verification code incorrect message', () => {
    submitAndReceiveResponse('changePassword', 'failure', 'verificationCodeIncorrect');
    expect(getErrorMessage()).toContain('The verification code is invalid');
  });

  it('should display the password cannot be blank message', () => {
    submitAndReceiveResponse('changePassword', 'failure', 'passwordIsBlank');
    expect(getErrorMessage()).toContain('Password cannot be blank');
  });

  it('should show the passwords do not match message', () => {
    submitAndReceiveResponse('changePassword', 'failure', 'passwordsDoNotMatch');
    expect(getErrorMessage()).toContain('Passwords do not match');
  });

  it('should go to the complete page', () => {
    const router = TestBed.get(Router);
    const navigateSpy = spyOn(router, 'navigate');
    component.goToSuccessPage();
    const params = {
      username: null
    };
    expect(navigateSpy).toHaveBeenCalledWith(['/forgot/teacher/password/complete'], {
      queryParams: params,
      skipLocationChange: true
    });
  });

  it('should navigate to the complete page after successfully submitting the new password', () => {
    const router = TestBed.get(Router);
    const navigateSpy = spyOn(router, 'navigate');
    component.username = 'SpongebobSquarepants';
    component.verificationCode = '123456';
    component.setControlFieldValue('password', 'a');
    component.setControlFieldValue('confirmPassword', 'a');
    component.submit();
    fixture.detectChanges();
    const params = {
      username: 'SpongebobSquarepants'
    };
    expect(navigateSpy).toHaveBeenCalledWith(['/forgot/teacher/password/complete'], {
      queryParams: params,
      skipLocationChange: true
    });
  });
});
