import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ForgotTeacherPasswordChangeComponent } from './forgot-teacher-password-change.component';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {RouterTestingModule} from '@angular/router/testing';
import {ReactiveFormsModule} from '@angular/forms';
import {TeacherService} from '../../../teacher/teacher.service';
import {Observable} from 'rxjs/index';
import {Router} from '@angular/router';

export class MockTeacherService {
  changePassword(username: string, verificationCode: string, password: string,
                 confirmPassword: string): Observable<any> {
    return Observable.create(observer => {
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

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ForgotTeacherPasswordChangeComponent ],
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
    fixture = TestBed.createComponent(ForgotTeacherPasswordChangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
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
    spyOn(teacherService, 'changePassword').and.returnValue(observableResponse);
    component.submit();
    fixture.detectChanges();
    const errorMessageDiv = fixture.debugElement.nativeElement.querySelector('.error-message');
    expect(errorMessageDiv.textContent).toContain('You have submitted an incorrect verification code too many times recently');
  });

  it('should show the verification code expired message', () => {
    const teacherService = TestBed.get(TeacherService);
    const observableResponse = Observable.create(observer => {
      const response = {
        status: 'failure',
        messageCode: 'verificationCodeExpired'
      };
      observer.next(response);
      observer.complete();
    });
    spyOn(teacherService, 'changePassword').and.returnValue(observableResponse);
    component.submit();
    fixture.detectChanges();
    const errorMessageDiv = fixture.debugElement.nativeElement.querySelector('.error-message');
    expect(errorMessageDiv.textContent).toContain('The verification code has expired');
  });

  it('should show the verification code incorrect message', () => {
    const teacherService = TestBed.get(TeacherService);
    const observableResponse = Observable.create(observer => {
      const response = {
        status: 'failure',
        messageCode: 'verificationCodeIncorrect'
      };
      observer.next(response);
      observer.complete();
    });
    spyOn(teacherService, 'changePassword').and.returnValue(observableResponse);
    component.submit();
    fixture.detectChanges();
    const errorMessageDiv = fixture.debugElement.nativeElement.querySelector('.error-message');
    expect(errorMessageDiv.textContent).toContain('The verification code is in correct');
  });

  it('should show the passwords do not match message', () => {
    const teacherService = TestBed.get(TeacherService);
    const observableResponse = Observable.create(observer => {
      const response = {
        status: 'failure',
        messageCode: 'passwordsDoNotMatch'
      };
      observer.next(response);
      observer.complete();
    });
    spyOn(teacherService, 'changePassword').and.returnValue(observableResponse);
    component.submit();
    fixture.detectChanges();
    const errorMessageDiv = fixture.debugElement.nativeElement.querySelector('.error-message');
    expect(errorMessageDiv.textContent).toContain('Passwords do not match');
  });

  it('should go to the complete page', () => {
    const router = TestBed.get(Router);
    const navigateSpy = spyOn(router, 'navigate');
    component.goToSuccessPage();
    const params = {
      username: null
    };
    expect(navigateSpy).toHaveBeenCalledWith(['/forgot/teacher/password/complete'],
      {queryParams: params, skipLocationChange: true});
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
    expect(navigateSpy).toHaveBeenCalledWith(['/forgot/teacher/password/complete'],
      {queryParams: params, skipLocationChange: true});
  });
});
