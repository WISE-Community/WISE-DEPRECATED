import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ForgotTeacherUsernameComponent } from './forgot-teacher-username.component';
import { ReactiveFormsModule } from '@angular/forms';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {RouterTestingModule} from '@angular/router/testing';
import {TeacherService} from '../../../teacher/teacher.service';
import {Observable} from 'rxjs/index';
import {Router} from '@angular/router';

export class MockTeacherService {
  sendForgotUsernameEmail(email: string): Observable<any> {
    return Observable.create(observer => {
      observer.next({
        status: 'success',
        messageCode: 'emailSent'
      });
      observer.complete();
    });
  }
}

describe('ForgotTeacherUsernameComponent', () => {
  let component: ForgotTeacherUsernameComponent;
  let fixture: ComponentFixture<ForgotTeacherUsernameComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ForgotTeacherUsernameComponent ],
      imports: [
        RouterTestingModule.withRoutes([]),
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
    fixture = TestBed.createComponent(ForgotTeacherUsernameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show a failed to send email message', () => {
    const teacherService = TestBed.get(TeacherService);
    const observableResponse = Observable.create(observer => {
      const response = {
        status: 'failure',
        messageCode: 'failedToSendEmail'
      };
      observer.next(response);
      observer.complete();
    });
    spyOn(teacherService, 'sendForgotUsernameEmail').and.returnValue(observableResponse);
    component.submit();
    fixture.detectChanges();
    const errorMessageDiv = fixture.debugElement.nativeElement.querySelector('.error-message');
    expect(errorMessageDiv.textContent).toContain('The server has encountered an error and was unable to send the email to you');
  });

  it('should show an email not found message', () => {
    const teacherService = TestBed.get(TeacherService);
    const observableResponse = Observable.create(observer => {
      const response = {
        status: 'failure',
        messageCode: 'emailNotFound'
      };
      observer.next(response);
      observer.complete();
    });
    spyOn(teacherService, 'sendForgotUsernameEmail').and.returnValue(observableResponse);
    component.submit();
    fixture.detectChanges();
    const errorMessageDiv = fixture.debugElement.nativeElement.querySelector('.error-message');
    expect(errorMessageDiv.textContent).toContain('We did not find a WISE account associated with the email you entered');
  });

  it('should navigate to the success page', () => {
    const teacherService = TestBed.get(TeacherService);
    const observableResponse = Observable.create(observer => {
      const response = {
        status: 'success',
        messageCode: 'emailSent'
      };
      observer.next(response);
      observer.complete();
    });
    spyOn(teacherService, 'sendForgotUsernameEmail').and.returnValue(observableResponse);
    const router = TestBed.get(Router);
    const navigateSpy = spyOn(router, 'navigate');
    component.setControlFieldValue('email', 'spongebob@bikinibottom.com');
    component.submit();
    fixture.detectChanges();
    expect(navigateSpy).toHaveBeenCalledWith(['/forgot/teacher/username/complete']);
  });

  it('should navigate to the create new account page', () => {
    const router = TestBed.get(Router);
    const navigateSpy = spyOn(router, 'navigate');
    component.createNewAccount();
    expect(navigateSpy).toHaveBeenCalledWith(['/join']);
  });
});
