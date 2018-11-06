import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ForgotTeacherPasswordVerifyComponent } from './forgot-teacher-password-verify.component';
import {TeacherService} from '../../../teacher/teacher.service';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {RouterTestingModule} from '@angular/router/testing';
import {Observable} from 'rxjs/index';
import {Router} from '@angular/router';

export class MockTeacherService {
  checkVerificationCode(username: string, verificationCode: string): Observable<any> {
    return Observable.create(observer => {
      observer.next({
        status: 'success',
        messageCode: 'verificationCodeCorrect'
      });
      observer.complete();
    });
  }
}

describe('ForgotTeacherPasswordVerifyComponent', () => {
  let component: ForgotTeacherPasswordVerifyComponent;
  let fixture: ComponentFixture<ForgotTeacherPasswordVerifyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ForgotTeacherPasswordVerifyComponent ],
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
    fixture = TestBed.createComponent(ForgotTeacherPasswordVerifyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the verification code has expired message', () => {
    const teacherService = TestBed.get(TeacherService);
    const observableResponse = Observable.create(observer => {
      const response = {
        status: 'failure',
        messageCode: 'verificationCodeExpired'
      };
      observer.next(response);
      observer.complete();
    });
    spyOn(teacherService, 'checkVerificationCode').and.returnValue(observableResponse);
    component.submit();
    fixture.detectChanges();
    const errorMessageDiv = fixture.debugElement.nativeElement.querySelector('.error-message');
    expect(errorMessageDiv.textContent).toContain('The verification code has expired');
  });

  it('should show the verification code is incorrect message', () => {
    const teacherService = TestBed.get(TeacherService);
    const observableResponse = Observable.create(observer => {
      const response = {
        status: 'failure',
        messageCode: 'verificationCodeIncorrect'
      };
      observer.next(response);
      observer.complete();
    });
    spyOn(teacherService, 'checkVerificationCode').and.returnValue(observableResponse);
    component.submit();
    fixture.detectChanges();
    const errorMessageDiv = fixture.debugElement.nativeElement.querySelector('.error-message');
    expect(errorMessageDiv.textContent).toContain('The verification code is incorrect');
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
    spyOn(teacherService, 'checkVerificationCode').and.returnValue(observableResponse);
    component.submit();
    fixture.detectChanges();
    const errorMessageDiv = fixture.debugElement.nativeElement.querySelector('.error-message');
    expect(errorMessageDiv.textContent).toContain('You have submitted an incorrect verification code too many times recently');
  });

  it('should navigate to the change password page', () => {
    const router = TestBed.get(Router);
    const navigateSpy = spyOn(router, 'navigate');
    component.goToChangePasswordPage();
    const params = {
      username: null,
      verificationCode: ''
    };
    expect(navigateSpy).toHaveBeenCalledWith(['/forgot/teacher/password/change'],
      {queryParams: params, skipLocationChange: true});
  });

  it('should navigate to the change password page after successfully submitting the verification code', () => {
    const router = TestBed.get(Router);
    const navigateSpy = spyOn(router, 'navigate');
    component.username = 'SpongebobSquarepants';
    component.setControlFieldValue('verificationCode', '123456');
    component.submit();
    fixture.detectChanges();
    const params = {
      username: 'SpongebobSquarepants',
      verificationCode: '123456'
    };
    expect(navigateSpy).toHaveBeenCalledWith(['/forgot/teacher/password/change'],
      {queryParams: params, skipLocationChange: true});
  });
});
