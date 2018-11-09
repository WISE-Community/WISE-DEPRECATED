import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ForgotTeacherPasswordComponent } from './forgot-teacher-password.component';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {RouterTestingModule} from '@angular/router/testing';
import {ReactiveFormsModule} from '@angular/forms';
import {TeacherService} from '../../../teacher/teacher.service';
import {Observable} from 'rxjs/index';
import {Router} from '@angular/router';

export class MockTeacherService {
  getVerificationCodeEmail(username: string): Observable<any> {
    return Observable.create(observer => {
      observer.next({
        status: 'success',
        messageCode: 'emailSent'
      });
      observer.complete();
    });
  }
}

describe('ForgotTeacherPasswordComponent', () => {
  let component: ForgotTeacherPasswordComponent;
  let fixture: ComponentFixture<ForgotTeacherPasswordComponent>;

  const submitAndReceiveResponse = (teacherServiceFunctionName, status, messageCode) => {
    const teacherService = TestBed.get(TeacherService);
    const observableResponse = createObservableResponse(status, messageCode);
    spyOn(teacherService, teacherServiceFunctionName).and.returnValue(observableResponse);
    component.submit();
    fixture.detectChanges();
  };

  const createObservableResponse = (status, messageCode) => {
    const observableResponse = Observable.create(observer => {
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

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ForgotTeacherPasswordComponent ],
      imports: [
        RouterTestingModule,
        ReactiveFormsModule
      ],
      providers: [
        { provide: TeacherService, useClass: MockTeacherService }
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForgotTeacherPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the username not found message', () => {
    submitAndReceiveResponse('getVerificationCodeEmail', 'failure', 'usernameNotFound');
    expect(getErrorMessage()).toContain('We could not find that username');
  });

  it('should show the too many verification code attempts message', () => {
    submitAndReceiveResponse('getVerificationCodeEmail', 'failure', 'tooManyVerificationCodeAttempts');
    expect(getErrorMessage()).toContain('You have submitted an incorrect verification code too many times recently');
  });

  it('should show the failed to send email message', () => {
    submitAndReceiveResponse('getVerificationCodeEmail', 'failure', 'failedToSendEmail');
    expect(getErrorMessage()).toContain('The server has encountered an error and was unable to send the email to you');
  });

  it('should navigate to the forgot teacher username page', () => {
    const router = TestBed.get(Router);
    const navigateSpy = spyOn(router, 'navigate');
    component.goToForgotTeacherUsernamePage();
    expect(navigateSpy).toHaveBeenCalledWith(['/forgot/teacher/username']);
  });

  it('should navigate to the verify code page', () => {
    const router = TestBed.get(Router);
    const navigateSpy = spyOn(router, 'navigate');
    component.goToVerificationCodePage();
    const params = {
      username: ''
    };
    expect(navigateSpy).toHaveBeenCalledWith(['/forgot/teacher/password/verify'], {queryParams: params, skipLocationChange: true});
  });

  it('should navigate to the verify code page after successfully sending a valid username', () => {
    const router = TestBed.get(Router);
    const navigateSpy = spyOn(router, 'navigate');
    component.setControlFieldValue('username', 'SpongebobSquarepants');
    component.submit();
    fixture.detectChanges();
    const params = {
      username: 'SpongebobSquarepants'
    };
    expect(navigateSpy).toHaveBeenCalledWith(['/forgot/teacher/password/verify'], {queryParams: params, skipLocationChange: true});
  });
});
