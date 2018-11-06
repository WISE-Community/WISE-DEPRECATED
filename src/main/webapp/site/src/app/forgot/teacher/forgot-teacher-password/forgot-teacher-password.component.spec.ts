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
    const teacherService = TestBed.get(TeacherService);
    const observableResponse = Observable.create(observer => {
      const response = {
        status: 'failure',
        messageCode: 'usernameNotFound'
      };
      observer.next(response);
      observer.complete();
    });
    spyOn(teacherService, 'getVerificationCodeEmail').and.returnValue(observableResponse);
    component.submit();
    fixture.detectChanges();
    const errorMessageDiv = fixture.debugElement.nativeElement.querySelector('.error-message');
    expect(errorMessageDiv.textContent).toContain('We could not find that username');
  });

  it('should show the too many verification code attempts message', () => {
    const teacherService = TestBed.get(TeacherService);
    const observableResponse = Observable.create(observer => {
      const response = {
        status: 'failure',
        messageCode: 'tooManyVerificationCodeAttempts'
      };
      observer.next(response);
      observer.complete();
    });
    spyOn(teacherService, 'getVerificationCodeEmail').and.returnValue(observableResponse);
    component.submit();
    fixture.detectChanges();
    const errorMessageDiv = fixture.debugElement.nativeElement.querySelector('.error-message');
    expect(errorMessageDiv.textContent).toContain('You have submitted an incorrect verification code too many times recently');
  });

  it('should show the failed to send email message', () => {
    const teacherService = TestBed.get(TeacherService);
    const observableResponse = Observable.create(observer => {
      const response = {
        status: 'failure',
        messageCode: 'failedToSendEmail'
      };
      observer.next(response);
      observer.complete();
    });
    spyOn(teacherService, 'getVerificationCodeEmail').and.returnValue(observableResponse);
    component.submit();
    fixture.detectChanges();
    const errorMessageDiv = fixture.debugElement.nativeElement.querySelector('.error-message');
    expect(errorMessageDiv.textContent).toContain('The server has encountered an error and was unable to send the email to you');
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
